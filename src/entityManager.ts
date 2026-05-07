import { EventEmitter } from 'events'
import { EspHomeClient } from 'esphome-client'

export interface ManagedEntity {
	id: string
	name: string
	key: number
	type: string
	state: any
}

export class EntityManager extends EventEmitter {
	private entities: Map<number, ManagedEntity> = new Map()
	private entityStates: Map<number, any> = new Map()

	constructor(private client: InstanceType<typeof EspHomeClient>) {
		super()
		this.setupListeners()
	}

	private setupListeners() {
		;(this.client as any).on('entities', (entities: any[]) => {
			this.handleEntitiesDiscovered(entities)
		})

		;(this.client as any).on('telemetry', (data: any) => {
			this.handleTelemetry(data)
		})

		;(this.client as any).on('error', (error: any) => {
			this.emit('error', error)
		})
	}

	private handleEntitiesDiscovered(entities: any[]) {
		if (!Array.isArray(entities)) return

		entities.forEach((entity) => {
			const entityType = String(entity.type || 'unknown').toLowerCase()
			// Match esphome-client ID format: "entityType-objectId"
			const id = `${entityType}-${entity.objectId}`.toLowerCase()
			const managed: ManagedEntity = {
				id,
				name: entity.name || 'Unknown',
				key: entity.key,
				type: entityType,
				state: null,
			}
			this.entities.set(entity.key, managed)
		})

		this.emit('refreshEntities')
	}

	private handleTelemetry(data: any) {
		if (!data || typeof data.key !== 'number') return

		const entity = this.entities.get(data.key)
		if (!entity) return

		this.entityStates.set(data.key, data)
		entity.state = data
		this.emit('state', entity)
	}

	getAll<T extends ManagedEntity>(type: string): T[] {
		return Array.from(this.entities.values()).filter((e) => e.type === type) as T[]
	}

	getEntity(id: string, type: string): ManagedEntity | undefined {
		for (const entity of this.entities.values()) {
			if (entity.id === id && entity.type === type) {
				return entity
			}
		}
		return undefined
	}

	getEntityByKey(key: number): ManagedEntity | undefined {
		return this.entities.get(key)
	}

	async switchSetState(entityId: string, state: boolean): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				const entity = Array.from(this.entities.values()).find((e) => e.id === entityId)
				if (!entity) {
					console.log(`[ESPHome] Entity not found for id: ${entityId}`)
					reject(new Error(`Entity not found for id: ${entityId}`))
					return
				}
				
				console.log(`[ESPHome] Sending switch command: id=${entity.id}, state=${state}`)
				;(this.client as any).sendSwitchCommand?.(entity.id, state)
				resolve()
			} catch (error) {
				console.log(`[ESPHome] Switch command error: ${(error as Error).message}`)
				reject(error)
			}
		})
	}

	async lightSetState(key: number, data: any): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				;(this.client as any).sendLightCommand?.(key, data)
				resolve()
			} catch (error) {
				reject(error)
			}
		})
	}

	destroy() {
		this.removeAllListeners()
		this.entities.clear()
		this.entityStates.clear()
	}
}
