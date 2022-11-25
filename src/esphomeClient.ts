import { EventEmitter } from 'events'
import { EsphomeSocket } from './connection/esphomeSocket'
import { Entities, EntityType } from './entities'
import { ListEntitiesDoneResponse, ListEntitiesRequest, SubscribeStatesRequest } from './proto/api'

export class EsphomeClient extends EventEmitter {
	private socket: EsphomeSocket | null = null
	private entities: { [id: string]: EntityType } = {}
	constructor() {
		super()
	}

	private removeAllEntities() {
		for (const id in this.entities) {
			this.entities[id].destroy()
			delete this.entities[id]
		}
	}

	connect(host: string, port?: number, password?: string) {
		this.disconnect()

		const socket = new EsphomeSocket(host, port, password)
		socket.on('connect', () => {
			this.removeAllEntities()
			this.socket?.writeRequest(ListEntitiesRequest, {})
			this.emit('connected')
		})

		Object.values(Entities).forEach((entity) => {
			entity.subscribe(socket, (e) => this.addEntity(e))
		})

		socket.addMessageListener(ListEntitiesDoneResponse, () => {
			this.socket?.writeRequest(SubscribeStatesRequest, {})
			this.emit('refreshEntities')
		})
		socket.on('end', () => {
			this.emit('disconnected')
		})
		socket.on('error', (e) => {
			this.emit('error', e)
		})
		this.socket = socket
	}

	private addEntity(instance: EntityType) {
		const id = instance.id
		if (this.entities[id]) {
			this.emit('warn', `Ignoring Duplicate Entity Id: ${id}`)
		} else {
			this.entities[id] = instance
			instance.on('state', (entity) => this.onEntityStateChanged(entity))
		}
	}

	private onEntityStateChanged(entity: EntityType) {
		this.emit('state', entity)
	}

	disconnect() {
		if (this.socket) {
			this.socket.destroy()
			this.socket = null
		}
		this.removeAllEntities()
	}

	public getAll<T extends EntityType>(entityClass: { is: (e: unknown) => e is T }): T[] {
		return Object.values(this.entities).filter(entityClass.is)
	}

	public getEntity<T extends EntityType>(id: string, entityClass: { is: (e: unknown) => e is T }): T | undefined {
		const entity = this.entities[id]
		if (entity && entityClass.is(entity)) {
			return entity
		}
		return undefined
	}
}
