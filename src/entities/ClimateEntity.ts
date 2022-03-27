import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesClimateResponse, ClimateCommandRequest, ClimateStateResponse, ClimateMode } from '../proto/api'

export default class Climate extends StatefulEntity<ListEntitiesClimateResponse, ClimateStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: Climate) => void) {
		socket.addMessageListener(ListEntitiesClimateResponse, (config) => {
			const instance = new Climate(socket, config)
			newEntityCallback(instance)
		})
	}

	get supportedModes(): ClimateMode[] {
		return this.config.supportedModes
	}

	get mode(): ClimateMode {
		return this._state.mode
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesClimateResponse) {
		super(socket, config, ClimateStateResponse)
	}

	private command(data: Partial<ClimateCommandRequest>) {
		this.socket.writeRequest(ClimateCommandRequest, { ...data, key: this.config.key })
	}

	setMode(mode: ClimateMode) {
		this.command({ mode, hasMode: true })
	}
}
