import { EventEmitter } from 'events'
import { HelloRequest, ConnectRequest, HelloResponse, ConnectResponse, PingRequest, PingResponse } from '../proto/api'
import { TCPHelper } from '@companion-module/base'
import { deserialize, EsphomeBinaryReadOptions, extractMessageId, serialize } from './util'
import { IMessageType } from '@protobuf-ts/runtime'

export const DEFAULT_PORT = 6053
const KEEPALIVE_MS = 15_000

enum ConnectionState {
	Disconnected,
	Connecting,
	Handshaking_Hello,
	Handshaking_Login,
	Connected,
}

const HelloResponseId = extractMessageId(HelloResponse)
const ConnectResponseId = extractMessageId(ConnectResponse)
const PingRequestId = extractMessageId(PingRequest)

class MessageHandler extends EventEmitter {
	constructor(private readonly type: IMessageType<any>) {
		super()
	}

	processPayload(payload: Uint8Array) {
		const message = this.type.fromBinary(payload, EsphomeBinaryReadOptions)
		this.emit('data', message)
	}

	destroy() {
		this.removeAllListeners()
	}
}

export class EsphomeSocket extends EventEmitter {
	private tcp: TCPHelper
	private buffer: Buffer
	private connectionState: ConnectionState = ConnectionState.Connecting
	private keepaliveTimer?: NodeJS.Timeout
	private readonly messageHandlers: { [index: number]: MessageHandler } = {}

	constructor(host: string, port: number = DEFAULT_PORT, private readonly password: string = '') {
		super()
		if (!host) throw new Error('host is required')
		this.tcp = new TCPHelper(host, port)
		this.buffer = Buffer.from([])
		this.tcp.on('data', (data) => {
			this.buffer = Buffer.concat([this.buffer, data])
			let message
			try {
				while ((message = deserialize(this.buffer))) {
					this.buffer = this.buffer.slice(message.length)
					this.onFrame(message.messageId, message.payload)
				}
			} catch (e) {
				this.emit('error', e)
			}
		})
		this.tcp.on('end', () => {
			this.connectionState = ConnectionState.Disconnected
			this.emit('end')
		})
		this.tcp.on('connect', async () => {
			this.sendHelloRequest()
		})
		this.tcp.on('error', (error) => {
			this.emit('error', error)
		})
	}

	private sendHelloRequest(): void {
		this.connectionState = ConnectionState.Handshaking_Hello
		this.writeRequest(HelloRequest, {
			clientInfo: 'companion-module',
		})
	}

	private sendConnectRequest(): void {
		this.connectionState = ConnectionState.Handshaking_Login
		this.writeRequest(ConnectRequest, {
			password: this.password,
		})
	}

	private finishConnection() {
		this.connectionState = ConnectionState.Connected
		this.emit('connect')
		this.startKeepaliveTimer()
	}

	private startKeepaliveTimer() {
		if (!this.keepaliveTimer) {
			this.keepaliveTimer = setTimeout(() => this.initiatePing(), KEEPALIVE_MS)
		}
	}

	private clearKeepaliveTimer() {
		if (this.keepaliveTimer) {
			clearTimeout(this.keepaliveTimer)
			delete this.keepaliveTimer
		}
	}

	private async initiatePing() {
		this.clearKeepaliveTimer()
		try {
			await this.writeRequestAndReadResponse(PingRequest, {}, PingResponse, 2.5 * KEEPALIVE_MS)
			this.startKeepaliveTimer()
		} catch (e: any) {
			this.emit('error', e)
		}
	}

	private onFrame(messageId: number, payload: Uint8Array) {
		if (messageId === PingRequestId) {
			this.writeRequest(PingResponse, {})
		} else if (this.connectionState === ConnectionState.Handshaking_Hello && messageId === HelloResponseId) {
			this.sendConnectRequest()
		} else if (this.connectionState === ConnectionState.Handshaking_Login && messageId === ConnectResponseId) {
			this.finishConnection()
		} else if (this.connectionState === ConnectionState.Connected) {
			const messageHandler = this.messageHandlers[messageId]
			if (messageHandler) {
				messageHandler.processPayload(payload)
			}
		}
	}

	connect() {
		this.tcp.connect()
	}

	writeRequest<T extends object>(requestType: IMessageType<T>, data: T) {
		const request = requestType.create(data)
		const messageId = extractMessageId(requestType)
		const payload = requestType.toBinary(request)
		this.tcp.send(serialize(messageId, payload)).catch((err) => {
			if (err) this.emit('error', err)
		})
	}

	writeRequestAndReadResponse<TRequest extends object, TResponse extends object>(
		requestType: IMessageType<TRequest>,
		data: TRequest,
		responseType: IMessageType<TResponse>,
		timeoutMs = 1000_000
	): Promise<TResponse> {
		return new Promise((_resolve, _reject) => {
			const clear = () => {
				this.removeMessageListener(responseType, handler)
				clearTimeout(timeout)
			}
			const handler = (message: TResponse) => {
				clear()
				_resolve(message)
			}
			this.addMessageListener(responseType, handler)
			const timeout = setTimeout(() => {
				clear()
				_reject(new Error('timeout'))
			}, timeoutMs)

			this.writeRequest(requestType, data)
		})
	}

	addMessageListener<T extends object>(type: IMessageType<T>, listener: (message: T) => void) {
		const id = extractMessageId(type)
		if (!this.messageHandlers[id]) {
			this.messageHandlers[id] = new MessageHandler(type)
		}
		this.messageHandlers[id].addListener('data', listener)
	}

	removeMessageListener<T extends object>(type: IMessageType<T>, listener: (message: T) => void) {
		const id = extractMessageId(type)
		const handler = this.messageHandlers[id]
		if (handler) {
			handler.removeListener('data', listener)
		}
	}

	destroy() {
		this.clearKeepaliveTimer()
		Object.values(this.messageHandlers).forEach((h) => h.destroy())
		this.tcp.removeAllListeners()
		this.removeAllListeners()
		this.tcp.destroy()
	}
}
