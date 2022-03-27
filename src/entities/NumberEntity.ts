import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesNumberResponse, NumberCommandRequest, NumberStateResponse } from '../proto/api'

export default class NumberEntity extends StatefulEntity<ListEntitiesNumberResponse, NumberStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: NumberEntity) => void) {
		socket.addMessageListener(ListEntitiesNumberResponse, (config) => {
			const instance = new NumberEntity(socket, config)
			newEntityCallback(instance)
		})
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesNumberResponse) {
		super(socket, config, NumberStateResponse)
	}

	get minValue(): number {
		return this.config.minValue
	}

	get maxValue(): number {
		return this.config.maxValue
	}

	get step(): number {
		return this.config.step
	}

	get state(): number {
		return this._state.state
	}

	private command(data: Partial<NumberCommandRequest>) {
		this.socket.writeRequest(NumberCommandRequest, { ...data, key: this.config.key })
	}

	setState(state: number) {
		this.command({ state })
	}
}
