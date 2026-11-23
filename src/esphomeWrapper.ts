import { EspHomeClient, Entity } from 'esphome-client'

/**
 * Wrapper around esphome-client to provide a simpler API for the companion module.
 * Subscribes to EspHomeClient events and caches latest states.
 */
export class EsphomeWrapper {
	// Current client instance (null when not connected)
	private _client: EspHomeClient | null = null
	// Latest state cache - stores the most recent event data for each entity ID
	private readonly latestState: Map<string, any> = new Map()
	// Internal event emitter for wrapper events
	private _events = new Map<string, Array<(...args: any[]) => void | Promise<void>>>()

	constructor(_host?: string, _port?: number, _psk?: string) {
		console.log('[ESPHome] EsphomeWrapper initialized')
	}

	async connect(host: string, port: number | undefined, psk: string | undefined): Promise<void> {
		console.log('[ESPHome] Connecting:', { host, port: port || 6053, pskPresent: !!psk })

		if (this._client) {
			console.log('[ESPHome] Disconnecting existing client')
			this._client.disconnect()
			this._client = null
		}

		const client = new EspHomeClient({
			host,
			port: port || 6053,
			psk: psk || undefined,
			logger: {
				debug: (msg: string) => console.debug('[ESPHome]', msg),
				info: (msg: string) => console.info('[ESPHome]', msg),
				warn: (msg: string) => console.warn('[ESPHome]', msg),
				error: (msg: string) => console.error('[ESPHome]', msg),
			},
		})
		this._client = client
		this.setupEventListeners(client)

		try {
			await client.connect()
			console.log('[ESPHome] client.connect() resolved')
		} catch (err: any) {
			console.error('[ESPHome] Failed to connect:', err?.message ?? err)
			if (this._client === client) {
				this._client = null
			}
			throw err
		}
	}

	disconnect(): void {
		console.log('[ESPHome] Disconnecting')
		if (this._client) {
			this._client.disconnect()
			this._client = null
		}
		this.latestState.clear()
	}

	private setupEventListeners(client: EspHomeClient): void {
		// Listen for entity discovery
		client.on('entities', (snapshot: Entity[]) => {
			if (this._client !== client) return
			console.log('[ESPHome] Entities discovered:', snapshot.length, 'entities')
			this.refreshEntityDiscovery(snapshot)
			this.emit('refreshEntities')
		})

		// Subscribe to lifecycle and telemetry streams concurrently so neither blocks the other
		void this.consumeLifecycleStream(client)
		void this.consumeTelemetryStream(client)
	}

	private async consumeLifecycleStream(client: EspHomeClient): Promise<void> {
		try {
			for await (const event of client.lifecycle()) {
				if (this._client !== client) break
				if (event.kind === 'connect') {
					console.log('[ESPHome] connected', event.encrypted ? '(encrypted)' : '(plaintext)')
					this.emit('connected')
				} else if (event.kind === 'disconnect') {
					const reason = event.cause?.message
					console.log('[ESPHome] Disconnected:', reason)
					this.emit('disconnected', reason)
				}
			}
		} catch (err) {
			if (this._client === client) {
				console.error('[ESPHome] Lifecycle stream error:', err)
			}
		}
	}

	private async consumeTelemetryStream(client: EspHomeClient): Promise<void> {
		try {
			for await (const event of client.telemetry()) {
				if (this._client !== client) break
				this.handleTelemetryEvent(event)
			}
		} catch (err) {
			if (this._client === client) {
				console.error('[ESPHome] Telemetry stream error:', err)
			}
		}
	}

	private handleTelemetryEvent(event: any): void {
		if (!event || !event.entity) return
		this.latestState.set(event.entity, event)
		this.emit('state', event.entity, event.type)
	}

	private refreshEntityDiscovery(entities: Entity[]): void {
		console.log('[ESPHome] Refreshing entity discovery with', entities.length, 'entities')

		const lights: any[] = []
		const sensors: any[] = []
		const binarySensors: any[] = []
		const buttons: any[] = []
		const climate: any[] = []
		const covers: any[] = []
		const fans: any[] = []
		const locks: any[] = []
		const switches: any[] = []
		const numbers: any[] = []
		const selects: any[] = []
		const textSensors: any[] = []

		entities.forEach((entity: Entity) => {
			if (!entity) return

			switch (entity.type) {
				case 'light':
					lights.push(entity)
					break
				case 'sensor':
					sensors.push(entity)
					break
				case 'binary_sensor':
					binarySensors.push(entity)
					break
				case 'button':
					buttons.push(entity)
					break
				case 'climate':
					climate.push(entity)
					break
				case 'cover':
					covers.push(entity)
					break
				case 'fan':
					fans.push(entity)
					break
				case 'lock':
					locks.push(entity)
					break
				case 'switch':
					switches.push(entity)
					break
				case 'number':
					numbers.push(entity)
					break
				case 'select':
					selects.push(entity)
					break
				case 'text_sensor':
					textSensors.push(entity)
					break
			}
		})

		console.log('[ESPHome] Entity counts:', {
			lights: lights.length,
			sensors: sensors.length,
			binarySensors: binarySensors.length,
			buttons: buttons.length,
			climate: climate.length,
			covers: covers.length,
			fans: fans.length,
			locks: locks.length,
			switches: switches.length,
			numbers: numbers.length,
			selects: selects.length,
			textSensors: textSensors.length,
		})
	}

	getAvailableEntityIds(): Record<string, string[]> {
		if (!this._client) return {}
		return this._client.getAvailableEntityIds()
	}

	getEntities(type?: string): Array<Entity & { id: string }> {
		if (!this._client) return []
		const all = this._client.getEntitiesWithIds()
		return type ? all.filter((entity) => entity.type === type) : all
	}

	getEntity(entityId: string): (Entity & { id: string }) | undefined {
		if (!this._client) return undefined
		return this._client.getEntitiesWithIds().find((entity) => entity.id === entityId)
	}

	command(entityId: string, options: Record<string, unknown>): void {
		if (!this._client) return
		console.log('[ESPHome] Command:', entityId, options)
		this._client.command(entityId as any, options)
	}

	latest(entityId: string): any {
		return this._client?.latest(entityId as any) ?? this.latestState.get(entityId) ?? null
	}

	getLights(): any[] {
		const entityIds = this.getAvailableEntityIds()['light'] || []
		return entityIds.map((id: string) => ({
			key: 0, // Required field for WireEntity
			type: 'light' as const,
			name: `Light ${entityIds.indexOf(id) + 1}`,
			objectId: id,
		}))
	}

	getSensor(): any | undefined {
		const entities = this.getAvailableEntityIds()['sensor'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	getBinarySensor(): any | undefined {
		const entities = this.getAvailableEntityIds()['binary_sensor'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	getButton(): any | undefined {
		const entities = this.getAvailableEntityIds()['button'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	getClimate(): any | undefined {
		const entities = this.getAvailableEntityIds()['climate'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	getCover(): any | undefined {
		const entities = this.getAvailableEntityIds()['cover'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	getFan(): any | undefined {
		const entities = this.getAvailableEntityIds()['fan'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	getLock(): any | undefined {
		const entities = this.getAvailableEntityIds()['lock'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	getSwitch(): any | undefined {
		const entities = this.getAvailableEntityIds()['switch'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	getNumber(): any | undefined {
		const entities = this.getAvailableEntityIds()['number'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	getSelect(): any | undefined {
		const entities = this.getAvailableEntityIds()['select'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	getTextSensor(): any | undefined {
		const entities = this.getAvailableEntityIds()['text_sensor'] || []
		return entities.length > 0 ? entities[0] : undefined
	}

	clearEntities(): void {
		this.latestState.clear()
	}

	getEntityCount(type: string): number {
		switch (type) {
			case 'light':
				return this.getAvailableEntityIds()['light']?.length || 0
			case 'sensor':
				return this.getAvailableEntityIds()['sensor']?.length || 0
			case 'binary_sensor':
				return this.getAvailableEntityIds()['binary_sensor']?.length || 0
			case 'button':
				return this.getAvailableEntityIds()['button']?.length || 0
			case 'climate':
				return this.getAvailableEntityIds()['climate']?.length || 0
			case 'cover':
				return this.getAvailableEntityIds()['cover']?.length || 0
			case 'fan':
				return this.getAvailableEntityIds()['fan']?.length || 0
			case 'lock':
				return this.getAvailableEntityIds()['lock']?.length || 0
			case 'switch':
				return this.getAvailableEntityIds()['switch']?.length || 0
			case 'number':
				return this.getAvailableEntityIds()['number']?.length || 0
			case 'select':
				return this.getAvailableEntityIds()['select']?.length || 0
			case 'text_sensor':
				return this.getAvailableEntityIds()['text_sensor']?.length || 0
			default:
				return 0
		}
	}

	getLatestState(entityId: string): any {
		return this.latestState.get(entityId)
	}

	isOn(entityId: string): boolean | undefined {
		const state = this.getLatestState(entityId)
		if (!state) return undefined

		// Check if entity is on based on type
		switch (entityId.split('-')[0]) {
			case 'light':
				return state.state === true || state.brightness > 0
			case 'switch':
				return state.state === true
			case 'climate':
				return state.mode !== 'off'
			default:
				return undefined
		}
	}

	setState(entityId: string, value: Record<string, unknown>): void {
		if (!this._client) return
		console.log('[ESPHome] Setting state for', entityId, '=', value)
		this._client.commandAndAwait(entityId as any, value).catch((err) => {
			console.error('[ESPHome] State set failed:', err)
		})
	}

	getAllEntityIds(): Record<string, string[]> {
		return this.getAvailableEntityIds()
	}

	on(eventName: string, callback: (...args: any[]) => void | Promise<void>): void {
		console.log('[ESPHome] Registering event listener for:', eventName)
		this._events.set(eventName, [...(this._events.get(eventName) || []), callback])
	}

	emit(eventName: string, ...args: any[]): void {
		const handlers = this._events.get(eventName)
		if (handlers) {
			console.log('[ESPHome] Emitting event:', eventName, 'with', handlers.length, 'handlers')
			for (const handler of handlers) {
				void handler(...args)
			}
		}
	}

	lifecycle(): AsyncIterableIterator<any> {
		if (!this._client) throw new Error('Client not connected')
		return this._client.lifecycle() as unknown as AsyncGenerator<any>
	}

	telemetry(): AsyncIterableIterator<any> {
		if (!this._client) throw new Error('Client not connected')
		return this._client.telemetry() as unknown as AsyncGenerator<any>
	}

	warn(msg: string): void {
		console.warn('[ESPHome]', msg)
	}

	error(err: Error): void {
		console.error('[ESPHome] Error:', err.message)
	}

	// Get client instance for direct access to esphome-client methods
	getClient(): EspHomeClient | null {
		return this._client
	}
}
