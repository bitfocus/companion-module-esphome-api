import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesSwitchResponse, SwitchCommandRequest, SwitchStateResponse } from '../proto/api'

export default class Switch extends StatefulEntity<ListEntitiesSwitchResponse, SwitchStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: Switch) => void) {
		socket.addMessageListener(ListEntitiesSwitchResponse, (config) => {
			const instance = new Switch(socket, config)
			newEntityCallback(instance)
		})
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesSwitchResponse) {
		super(socket, config, SwitchStateResponse)
	}

	get isOn(): boolean {
		return this._state.state
	}

	private command(data: Partial<SwitchCommandRequest>) {
		this.socket.writeRequest(SwitchCommandRequest, { ...data, key: this.config.key })
	}

	setState(state: boolean) {
		this.command({ state })
	}
}
