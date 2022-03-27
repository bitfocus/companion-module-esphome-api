import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesTextSensorResponse, TextSensorStateResponse } from '../proto/api'

export default class TextSensor extends StatefulEntity<ListEntitiesTextSensorResponse, TextSensorStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: TextSensor) => void) {
		socket.addMessageListener(ListEntitiesTextSensorResponse, (config) => {
			const instance = new TextSensor(socket, config)
			newEntityCallback(instance)
		})
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesTextSensorResponse) {
		super(socket, config, TextSensorStateResponse)
	}

	get state(): string {
		return this._state.state
	}
}
