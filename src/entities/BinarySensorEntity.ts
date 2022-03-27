import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesBinarySensorResponse, BinarySensorStateResponse } from '../proto/api'

export default class BinarySensor extends StatefulEntity<ListEntitiesBinarySensorResponse, BinarySensorStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: BinarySensor) => void) {
		socket.addMessageListener(ListEntitiesBinarySensorResponse, (config) => {
			const instance = new BinarySensor(socket, config)
			newEntityCallback(instance)
		})
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesBinarySensorResponse) {
		super(socket, config, BinarySensorStateResponse)
	}

	get isOn(): boolean {
		return this._state.state
	}
}
