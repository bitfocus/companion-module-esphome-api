import { EventEmitter } from 'events'
import { EspHomeClient } from 'esphome-client'
import { EntityManager, ManagedEntity } from './entityManager'

export class EsphomeClient extends EventEmitter {
	private manager: EntityManager | null = null
	private client: InstanceType<typeof EspHomeClient> | null = null
	private host?: string
	private port?: number
	private encryptionKey?: string
	private reconnectTimer: NodeJS.Timeout | null = null
	private manualDisconnect = false
	private readonly reconnectIntervalMs = 15000

	constructor() {
		super()
	}

	async connect(host: string, port?: number, encryptionKey?: string) {
		this.host = host
		this.port = port
		this.encryptionKey = encryptionKey
		this.manualDisconnect = false
		this.clearReconnectTimer()

		try {
			const clientConfig: any = {
				host,
				port: port || 6053,
			}

			if (encryptionKey) {
				const trimmedKey = encryptionKey.trim()
				// ESPHome API expects base64-encoded 32-byte key
				// User can provide either:
				// 1. 64-char hex string (which we convert to base64)
				// 2. Already base64-encoded string (32 bytes = 44 chars in base64)
				const isHex = /^[0-9a-fA-F]{64}$/.test(trimmedKey)

				if (isHex) {
					// Convert 64-char hex to base64
					clientConfig.psk = Buffer.from(trimmedKey, 'hex').toString('base64')
				} else if (/^[A-Za-z0-9+/]+=*$/.test(trimmedKey)) {
					// Already base64, validate it
					try {
						const decoded = Buffer.from(trimmedKey, 'base64')
						if (decoded.length === 32) {
							clientConfig.psk = trimmedKey
						}
						// If not 32 bytes, don't set psk and let esphome-client handle it
					} catch {
						// Invalid base64, skip psk
					}
				}
				// If neither hex nor valid base64, don't set psk - connection will be unencrypted
			}

			this.client = new EspHomeClient(clientConfig)
			this.manager = new EntityManager(this.client)

			this.manager.on('refreshEntities', () => {
				this.emit('refreshEntities')
			})

			this.manager.on('state', () => {
				this.emit('state')
			})

			this.manager.on('error', (error: any) => {
				this.emit('error', error)
			})

			;(this.client as any).on('connect', () => {
				this.emit('connected')
			})

			;(this.client as any).on('disconnect', () => {
				this.emit('disconnected')
				if (!this.manualDisconnect) {
					this.emit('warn', 'ESPHome disconnected, scheduling reconnect')
					this.scheduleReconnect()
				}
			})

			;(this.client as any).on('error', (error: any) => {
				this.emit('error', error)
			})

			await this.client.connect()
		} catch (error) {
			process.stderr.write('Error in connect: ' + error + '\n')
			this.emit('error', error)
		}
	}

	private clearReconnectTimer() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}
	}

	private scheduleReconnect() {
		if (this.manualDisconnect || !this.host) {
			return
		}

		if (this.reconnectTimer) {
			return
		}

		this.reconnectTimer = setTimeout(async () => {
			this.reconnectTimer = null
			this.emit('warn', 'Attempting to reconnect to ESPHome device')
			try {
				await this.connect(this.host!, this.port, this.encryptionKey)
			} catch (error) {
				this.emit('error', error)
				this.scheduleReconnect()
			}
		}, this.reconnectIntervalMs)
	}

	disconnect() {
		this.manualDisconnect = true
		this.clearReconnectTimer()
		if (this.client) {
			this.client.disconnect()
			this.client = null
		}
		if (this.manager) {
			this.manager.destroy()
			this.manager = null
		}
	}

	public getAll<T extends ManagedEntity>(type: string): T[] {
		if (!this.manager) return []
		return this.manager.getAll(type) as T[]
	}

	public getEntity(id: string, type: string): ManagedEntity | undefined {
		if (!this.manager) return undefined
		return this.manager.getEntity(id, type)
	}

	public getEntityByKey(key: number): ManagedEntity | undefined {
		if (!this.manager) return undefined
		return this.manager.getEntityByKey(key)
	}

	public async switchSetState(entityId: string, state: boolean): Promise<void> {
		if (!this.manager) return
		return this.manager.switchSetState(entityId, state)
	}

	public async lightSetState(key: number, data: any): Promise<void> {
		if (!this.manager) return
		return this.manager.lightSetState(key, data)
	}
}
