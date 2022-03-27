import { EventEmitter } from 'events'
import { IMessageType } from '@protobuf-ts/runtime'
import { EsphomeSocket } from '../connection/esphomeSocket'

interface ListEntitiesResponseBase {
	readonly key: number
	readonly name: string
	readonly objectId: string
	readonly uniqueId: string
}

interface StateResponseBaseType {
	readonly key: number
}

export abstract class BaseEntity<ConfigType extends ListEntitiesResponseBase> extends EventEmitter {
	public readonly type: string = this.constructor.name

	constructor(protected readonly socket: EsphomeSocket, protected readonly config: ConfigType) {
		super()
		if (!config) throw new Error('config is required')
	}

	destroy() {
		this.removeAllListeners()
	}

	get key(): number {
		return this.config.key
	}

	get id(): string {
		return this.config.objectId
	}

	get name(): string {
		return this.config.name
	}
}

export class StatefulEntity<
	ConfigType extends ListEntitiesResponseBase,
	StateType extends StateResponseBaseType
> extends BaseEntity<ConfigType> {
	protected _state: StateType

	constructor(socket: EsphomeSocket, config: ConfigType, private readonly StateResponseType: IMessageType<StateType>) {
		super(socket, config)
		this._state = StateResponseType.create({})
		this.socket.addMessageListener(this.StateResponseType, this.onStateMessage)
	}

	destroy() {
		super.destroy()
		this.socket.removeMessageListener(this.StateResponseType, this.onStateMessage)
	}

	private onStateMessage = (newState: StateType) => {
		if (newState.key != this.key) return
		this._state = newState
		this.emit('state', this, newState)
	}
}
