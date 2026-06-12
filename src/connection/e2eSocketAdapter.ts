import { EventEmitter } from 'events'
import { EspHomeClient } from 'esphome-client'
import { IMessageType } from '@protobuf-ts/runtime'
import {
	ListEntitiesRequest,
	ListEntitiesDoneResponse,
	ListEntitiesBinarySensorResponse,
	ListEntitiesButtonResponse,
	ListEntitiesClimateResponse,
	ListEntitiesCoverResponse,
	ListEntitiesFanResponse,
	ListEntitiesLightResponse,
	ListEntitiesLockResponse,
	ListEntitiesNumberResponse,
	ListEntitiesSelectResponse,
	ListEntitiesSensorResponse,
	ListEntitiesSwitchResponse,
	ListEntitiesTextSensorResponse,
	SubscribeStatesRequest,
	BinarySensorStateResponse,
	ClimateStateResponse,
	CoverStateResponse,
	FanStateResponse,
	LightStateResponse,
	LockStateResponse,
	NumberStateResponse,
	SelectStateResponse,
	SensorStateResponse,
	SwitchStateResponse,
	TextSensorStateResponse,
	SwitchCommandRequest,
	LightCommandRequest,
	NumberCommandRequest,
	SelectCommandRequest,
	ClimateCommandRequest,
	CoverCommandRequest,
	LockCommandRequest,
	ButtonCommandRequest,
} from '../proto/api'

type MessageListener = (message: any) => void

interface MessageSubscription {
	type: IMessageType<any>
	listeners: MessageListener[]
}

/**
 * Adapter that bridges esphome-client library with the entity architecture
 * that was built around protobuf message subscriptions.
 */
export class E2ESocketAdapter extends EventEmitter {
	private messageSubscriptions: Map<string, MessageSubscription> = new Map()
	private entityCache: Map<number, any> = new Map()
	private stateCache: Map<number, any> = new Map()

	constructor(private readonly client: InstanceType<typeof EspHomeClient>) {
		super()
		this.setupClientListeners()
	}

	private setupClientListeners() {
		;(this.client as any).on('entities', (entities: any) => {
			this.handleEntitiesDiscovered(entities)
		})

		;(this.client as any).on('state', (state: any) => {
			this.handleStateUpdate(state)
		})

		;(this.client as any).on('error', (error: any) => {
			this.emit('error', error)
		})
	}

	private getMessageTypeName(type: IMessageType<any>): string {
		return (type as any).typeName || (type as any).constructor.name || 'unknown'
	}

	private handleEntitiesDiscovered(entities: any[]) {
		if (!entities || !Array.isArray(entities)) return

		entities.forEach((entity) => {
			try {
				const key = entity.key
				const type = entity.type?.toLowerCase() || ''

				this.entityCache.set(key, entity)

				// Emit entity based on type
				const typeMap: { [key: string]: IMessageType<any> } = {
					binary_sensor: ListEntitiesBinarySensorResponse,
					button: ListEntitiesButtonResponse,
					climate: ListEntitiesClimateResponse,
					cover: ListEntitiesCoverResponse,
					fan: ListEntitiesFanResponse,
					light: ListEntitiesLightResponse,
					lock: ListEntitiesLockResponse,
					number: ListEntitiesNumberResponse,
					select: ListEntitiesSelectResponse,
					sensor: ListEntitiesSensorResponse,
					switch: ListEntitiesSwitchResponse,
					text_sensor: ListEntitiesTextSensorResponse,
				}

				const messageType = typeMap[type]
				if (messageType) {
					const typeName = this.getMessageTypeName(messageType)
					const subscription = this.messageSubscriptions.get(typeName)
					if (subscription) {
						const msg = this.translateEntity(type, entity)
						subscription.listeners.forEach((listener) => listener(msg))
					}
				}
			} catch (error) {
				this.emit('error', error)
			}
		})

		// Emit done
		const doneName = this.getMessageTypeName(ListEntitiesDoneResponse)
		const doneSubscription = this.messageSubscriptions.get(doneName)
		if (doneSubscription) {
			doneSubscription.listeners.forEach((listener) => listener({}))
		}
		this.emit('listEntitiesDone')
	}

	private handleStateUpdate(stateUpdate: any) {
		try {
			const key = stateUpdate.key
			const entity = this.entityCache.get(key)
			if (!entity) return

			this.stateCache.set(key, stateUpdate)

			const type = entity.type?.toLowerCase() || ''

			const stateTypeMap: { [key: string]: IMessageType<any> } = {
				binary_sensor: BinarySensorStateResponse,
				climate: ClimateStateResponse,
				cover: CoverStateResponse,
				fan: FanStateResponse,
				light: LightStateResponse,
				lock: LockStateResponse,
				number: NumberStateResponse,
				select: SelectStateResponse,
				sensor: SensorStateResponse,
				switch: SwitchStateResponse,
				text_sensor: TextSensorStateResponse,
			}

			const messageType = stateTypeMap[type]
			if (messageType) {
				const typeName = this.getMessageTypeName(messageType)
				const subscription = this.messageSubscriptions.get(typeName)
				if (subscription) {
					const msg = this.translateState(type, key, stateUpdate)
					subscription.listeners.forEach((listener) => listener(msg))
				}
			}
		} catch (error) {
			this.emit('error', error)
		}
	}

	private translateEntity(type: string, entity: any): any {
		const base = {
			key: entity.key,
			name: entity.name,
			objectId: entity.objectId,
			uniqueId: entity.uniqueId,
		}

		switch (type) {
			case 'light':
				return {
					...base,
					supportedColorModes: entity.supportedColorModes || [],
					legacySupportsBrightness: entity.legacySupportsBrightness || false,
				}
			case 'number':
				return {
					...base,
					minValue: entity.minValue || 0,
					maxValue: entity.maxValue || 100,
					step: entity.step || 1,
				}
			case 'select':
				return {
					...base,
					options: entity.options || [],
				}
			case 'sensor':
				return {
					...base,
					unitOfMeasurement: entity.unitOfMeasurement || '',
				}
			default:
				return base
		}
	}

	private translateState(type: string, key: number, state: any): any {
		const base = { key }

		switch (type) {
			case 'binary_sensor':
				return { ...base, state: state.state || false }
			case 'climate':
				return { ...base, mode: state.mode || 0 }
			case 'cover':
				return { ...base, position: state.position || 0 }
			case 'fan':
				return { ...base, state: state.state || false }
			case 'light':
				return {
					...base,
					state: state.state || false,
					brightness: state.brightness || 255,
					colorMode: state.colorMode || 0,
					rgb: state.rgb || { r: 0, g: 0, b: 0 },
				}
			case 'lock':
				return { ...base, state: state.state || 0 }
			case 'number':
				return { ...base, state: state.state || 0 }
			case 'select':
				return { ...base, state: state.state || '' }
			case 'sensor':
				return { ...base, state: state.state?.toString() || '' }
			case 'switch':
				return { ...base, state: state.state || false }
			case 'text_sensor':
				return { ...base, state: state.state || '' }
			default:
				return base
		}
	}

	// Socket-like interface for entities
	addMessageListener<T extends object>(type: IMessageType<T>, listener: MessageListener) {
		const typeName = this.getMessageTypeName(type)
		if (!this.messageSubscriptions.has(typeName)) {
			this.messageSubscriptions.set(typeName, { type, listeners: [] })
		}
		const subscription = this.messageSubscriptions.get(typeName)!
		subscription.listeners.push(listener)
	}

	removeMessageListener<T extends object>(type: IMessageType<T>, listener: MessageListener) {
		const typeName = this.getMessageTypeName(type)
		const subscription = this.messageSubscriptions.get(typeName)
		if (subscription) {
			const index = subscription.listeners.indexOf(listener)
			if (index >= 0) {
				subscription.listeners.splice(index, 1)
			}
		}
	}

	writeRequest<T extends object>(requestType: IMessageType<T>, data: T) {
		const typeName = this.getMessageTypeName(requestType)

		// Map request types to esphome-client commands
		const requestTypeMap: { [key: string]: string } = {
			[this.getMessageTypeName(ListEntitiesRequest)]: 'listEntities',
			[this.getMessageTypeName(SubscribeStatesRequest)]: 'subscribeStates',
			[this.getMessageTypeName(SwitchCommandRequest)]: 'switchCommand',
			[this.getMessageTypeName(LightCommandRequest)]: 'lightCommand',
			[this.getMessageTypeName(NumberCommandRequest)]: 'numberCommand',
			[this.getMessageTypeName(SelectCommandRequest)]: 'selectCommand',
			[this.getMessageTypeName(ClimateCommandRequest)]: 'climateCommand',
			[this.getMessageTypeName(CoverCommandRequest)]: 'coverCommand',
			[this.getMessageTypeName(LockCommandRequest)]: 'lockCommand',
			[this.getMessageTypeName(ButtonCommandRequest)]: 'buttonCommand',
		}

		const commandType = requestTypeMap[typeName]
		if (!commandType) return

		const cmd = data as any

		switch (commandType) {
			case 'switchCommand':
				this.client.sendSwitchCommand?.(cmd.key, cmd.state)
				break
			case 'lightCommand':
				this.client.sendLightCommand?.(cmd.key, cmd)
				break
			case 'numberCommand':
				this.client.sendNumberCommand?.(cmd.key, cmd.state)
				break
			case 'selectCommand':
				this.client.sendSelectCommand?.(cmd.key, cmd.state)
				break
			case 'climateCommand':
				this.client.sendClimateCommand?.(cmd.key, cmd)
				break
			case 'coverCommand':
				this.client.sendCoverCommand?.(cmd.key, cmd)
				break
			case 'lockCommand':
				this.client.sendLockCommand?.(cmd.key, cmd.command)
				break
			case 'buttonCommand':
				this.client.sendButtonCommand?.(cmd.key)
				break
		}
	}

	emitListEntitiesStart() {
		// esphome-client handles entity discovery automatically
	}

	destroy() {
		this.messageSubscriptions.clear()
		this.entityCache.clear()
		this.stateCache.clear()
		this.removeAllListeners()
	}
}
