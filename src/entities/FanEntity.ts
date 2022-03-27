import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesFanResponse, FanCommandRequest, FanStateResponse } from '../proto/api'

export default class Fan extends StatefulEntity<ListEntitiesFanResponse, FanStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: Fan) => void) {
		socket.addMessageListener(ListEntitiesFanResponse, (config) => {
			const instance = new Fan(socket, config)
			newEntityCallback(instance)
		})
	}

	get isOn(): boolean {
		return this._state.state
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesFanResponse) {
		super(socket, config, FanStateResponse)
	}

	private command(data: Partial<FanCommandRequest>) {
		this.socket.writeRequest(FanCommandRequest, { ...data, key: this.config.key })
	}

	setState(state: boolean) {
		this.command({ state, hasState: true })
	}
}
