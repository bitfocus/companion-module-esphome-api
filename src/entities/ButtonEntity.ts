import { BaseEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ButtonCommandRequest, ListEntitiesButtonResponse } from '../proto/api'

export default class Button extends BaseEntity<ListEntitiesButtonResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: Button) => void) {
		socket.addMessageListener(ListEntitiesButtonResponse, (config) => {
			const instance = new Button(socket, config)
			newEntityCallback(instance)
		})
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesButtonResponse) {
		super(socket, config)
	}

	private command(data: Partial<ButtonCommandRequest>) {
		this.socket.writeRequest(ButtonCommandRequest, { ...data, key: this.config.key })
	}

	push() {
		this.command({})
	}
}
