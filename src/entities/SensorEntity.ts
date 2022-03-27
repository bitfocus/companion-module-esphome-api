import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesSensorResponse, SensorStateResponse } from '../proto/api'

export default class Sensor extends StatefulEntity<ListEntitiesSensorResponse, SensorStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: Sensor) => void) {
		socket.addMessageListener(ListEntitiesSensorResponse, (config) => {
			const instance = new Sensor(socket, config)
			newEntityCallback(instance)
		})
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesSensorResponse) {
		super(socket, config, SensorStateResponse)
	}

	get state(): number {
		return this._state.state
	}
}
