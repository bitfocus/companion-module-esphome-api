import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesCoverResponse, CoverCommandRequest, CoverStateResponse } from '../proto/api'

export default class Cover extends StatefulEntity<ListEntitiesCoverResponse, CoverStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: Cover) => void) {
		socket.addMessageListener(ListEntitiesCoverResponse, (config) => {
			const instance = new Cover(socket, config)
			newEntityCallback(instance)
		})
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesCoverResponse) {
		super(socket, config, CoverStateResponse)
	}

	get supportsPosition(): boolean {
		return this.config.supportsPosition
	}

	get isOpen(): boolean {
		return this._state.position > 0
	}

	private command(data: Partial<CoverCommandRequest>) {
		this.socket.writeRequest(CoverCommandRequest, { ...data, key: this.config.key })
	}

	setPosition(position: number) {
		this.command({ position, hasPosition: true })
	}
}
