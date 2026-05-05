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

		;(this.client as any).on('state', (state: any) => {
			this.handleStateUpdate(state)
		})

		;(this.client as any).on('error', (error: any) => {
			this.emit('error', error)
		})
	}

	private handleEntitiesDiscovered(entities: any[]) {
		if (!Array.isArray(entities)) return

		entities.forEach((entity) => {
			const managed: ManagedEntity = {
				id: entity.objectId || `entity_${entity.key}`,
				name: entity.name || 'Unknown',
				key: entity.key,
				type: entity.type || 'unknown',
				state: null,
			}
			this.entities.set(entity.key, managed)
		})

		this.emit('refreshEntities')
	}

	private handleStateUpdate(state: any) {
		const entity = this.entities.get(state.key)
		if (!entity) return

		this.entityStates.set(state.key, state)
		entity.state = state
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

	async switchSetState(key: number, state: boolean): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				;(this.client as any).sendSwitchCommand?.(key, state)
				resolve()
			} catch (error) {
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
