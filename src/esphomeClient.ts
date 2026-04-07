import { EventEmitter } from 'events'
import { Entities, EntityType } from './entities'
import { EspHomeClient } from 'esphome-client'
import { E2ESocketAdapter } from './connection/e2eSocketAdapter'

export class EsphomeClient extends EventEmitter {
	private adapter: E2ESocketAdapter | null = null
	private client: InstanceType<typeof EspHomeClient> | null = null
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

	async connect(host: string, port?: number, password?: string, encryptionKey?: string) {
		try {

		// Create the esphome-client library instance
		const clientConfig: any = {
			host,
			port: port || 6053,
		}

		if (encryptionKey) {
			try {
				clientConfig.psk = Buffer.from(encryptionKey, 'hex')
			} catch (error) {
				process.stderr.write('Invalid encryption key format: ' + error + '\n')
				// Skip setting psk if invalid
			}
		}

		this.client = new EspHomeClient(clientConfig)

		// Create adapter to bridge between esphome-client and entity architecture
		this.adapter = new E2ESocketAdapter(this.client)

		// Subscribe all entity types
		const adapter = this.adapter as any
		Object.values(Entities).forEach((entity) => {
			entity.subscribe(adapter, (e) => this.addEntity(e))
		})

		// Handle lifecycle events
		this.adapter.on('listEntitiesDone', () => {
			if (this.adapter) {
				// Trigger SubscribeStatesRequest through adapter
				const SubscribeStatesRequest = require('./proto/api').SubscribeStatesRequest
				this.adapter.writeRequest(SubscribeStatesRequest, {})
				this.emit('refreshEntities')
			}
		})

		this.client.on('connect', () => {
			this.removeAllEntities()
			// Trigger ListEntitiesRequest through adapter
			if (this.adapter) {
				this.adapter.emitListEntitiesStart()
			}
		})

		;(this.client as any).on('disconnect', () => {
			this.emit('disconnected')
		})

		;(this.client as any).on('error', (error: any) => {
			this.emit('error', error)
		})

		this.adapter.on('error', (error: any) => {
			this.emit('error', error)
		})

		this.adapter.on('warn', (message: any) => {
			this.emit('warn', message)
		})

			await this.client.connect()
		this.emit('connected')
		} catch (error) {
			process.stderr.write('Error in connect: ' + error + '\n')
			this.emit('error', error)
		}
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
		if (this.client) {
			this.client.disconnect()
			this.client = null
		}
		if (this.adapter) {
			this.adapter.destroy()
			this.adapter = null
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
