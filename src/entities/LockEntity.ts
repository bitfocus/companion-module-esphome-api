import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesLockResponse, LockCommand, LockCommandRequest, LockState, LockStateResponse } from '../proto/api'

export default class Lock extends StatefulEntity<ListEntitiesLockResponse, LockStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: Lock) => void) {
		socket.addMessageListener(ListEntitiesLockResponse, (config) => {
			const instance = new Lock(socket, config)
			newEntityCallback(instance)
		})
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesLockResponse) {
		super(socket, config, LockStateResponse)
	}

	get supportsOpen(): boolean {
		return this.config.supportsOpen
	}

	isState(state: LockState): boolean {
		return this._state.state == state;
	}

	private command(data: Partial<LockCommandRequest>) {
		this.socket.writeRequest(LockCommandRequest, { ...data, key: this.config.key })
	}

	setLockCommand(command: LockCommand) {
		this.command({ command })
	}
}
