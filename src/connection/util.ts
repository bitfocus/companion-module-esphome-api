import { BinaryReader, IMessageType, MESSAGE_TYPE } from '@protobuf-ts/runtime'

/*
 * Floats are a leaky abstraction and converting from a 32-bit
 * float to a 64-bit float adds error. This removes that so
 * that 0.2 from the ESP doesn't become 0.20000000298023224 here.
 * Floats can store 6-9 significant digits, typically 7.
 * 6 is chosen since its the only guarentee for a float and
 * should be sufficient for ESPHome usecases.
 */
class EsphomeBinaryReader extends BinaryReader {
	float(): number {
		const raw = super.float()
		return Number(raw.toPrecision(6))
	}
}

export const EsphomeBinaryReadOptions = {
	readerFactory: (bytes: Uint8Array) => new EsphomeBinaryReader(bytes),
}

export function getMessageTypeFromInstance<I extends object, T extends I>(messageInstance: T): IMessageType<I> {
	const messageType = (messageInstance as any)[MESSAGE_TYPE]
	if (!messageType) {
		throw new Error('messageInstance does not contain type information')
	}
	return messageType as IMessageType<I>
}

export function extractMessageId(messageType: IMessageType<any>): number {
	const idField = messageType.options.id
	if (!idField || typeof idField !== 'number') {
		throw new Error('messageType does not contain an id')
	}
	return idField
}

function varuint_to_bytes(value: number) {
	if (value <= 0x7f) return Buffer.from([value])
	const result = []
	while (value) {
		const temp = value & 0x7f
		value >>= 7
		result.push(value ? temp | 0x80 : temp)
	}

	return Buffer.from(result)
}
function bytes_to_varuint(bytes: Uint8Array) {
	let result = 0
	let bitpos = 0
	for (const byte of bytes) {
		result |= (byte & 0x7f) << bitpos
		bitpos += 7
		if ((byte & 0x80) === 0) return result
	}
	return null
}

function recv_varuint(producer: () => number | null) {
	let next = producer()
	if (next === null) {
		return null
	}
	const raw = [next]
	while (raw[raw.length - 1] !== null && raw[raw.length - 1] & 0x80) {
		next = producer()
		if (next === null) {
			return null
		}
		raw.push(next)
	}
	if (raw[raw.length - 1] === null) return null
	return bytes_to_varuint(Buffer.from(raw))
}

export function serialize(messageId: number, payload: Uint8Array) {
	return Buffer.from([0, ...varuint_to_bytes(payload.length), ...varuint_to_bytes(messageId), ...payload])
}

export function deserialize(buffer: Buffer): {
	messageId: number
	payload: Uint8Array
	length: number
} | null {
	if (buffer.length < 3) return null
	let offset = 0
	const next = () => {
		if (offset >= buffer.length) return null
		return buffer[offset++]
	}
	const t = next()
	if (t !== 0) throw new Error('Bad format. Expected 0 at the begin')

	const message_length = recv_varuint(next)
	if (message_length === null) return null
	const message_id = recv_varuint(next)
	if (message_id === null) return null
	if (message_length + offset > buffer.length) return null
	// else if(message_length + offset < buffer.length) throw new Error(`Bad format. Expected buffer length = ${message_length + offset}. Received ${buffer.length}`);
	return {
		messageId: message_id,
		payload: buffer.slice(offset, message_length + offset),
		length: message_length + offset,
	}
}
