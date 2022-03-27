import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesSelectResponse, SelectCommandRequest, SelectStateResponse } from '../proto/api'

export default class Select extends StatefulEntity<ListEntitiesSelectResponse, SelectStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: Select) => void) {
		socket.addMessageListener(ListEntitiesSelectResponse, (config) => {
			const instance = new Select(socket, config)
			newEntityCallback(instance)
		})
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesSelectResponse) {
		super(socket, config, SelectStateResponse)
	}

	get options(): string[] {
		return this.config.options
	}

	isState(state: string) {
		return state === this._state.state
	}

	private command(data: Partial<SelectCommandRequest>) {
		this.socket.writeRequest(SelectCommandRequest, { ...data, key: this.config.key })
	}

	setState(state: string) {
		this.command({ state })
	}
}
