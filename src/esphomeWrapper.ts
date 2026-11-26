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

	async connect(host: string, port: number | undefined, psk: string | undefined): Promise<void> {
		if (this._client) {
			this._client.disconnect()
			this._client = null
		}

		const client = new EspHomeClient({
			host,
			port: port || 6053,
			psk: psk || undefined,
			logger: {
				debug: () => {},
				info: () => {},
				warn: (msg: string) => console.warn('[ESPHome]', msg),
				error: (msg: string) => console.error('[ESPHome]', msg),
			},
		})
		this._client = client
		this.setupEventListeners(client)

		try {
			await client.connect()
		} catch (err: any) {
			console.error('[ESPHome] Failed to connect:', err?.message ?? err)
			if (this._client === client) {
				this._client = null
			}
			client.disconnect()
			throw err
		}
	}

	disconnect(): void {
		if (this._client) {
			this._client.disconnect()
			this._client = null
		}
		this.latestState.clear()
	}

	private setupEventListeners(client: EspHomeClient): void {
		// Listen for entity discovery
		client.on('entities', (_snapshot: Entity[]) => {
			if (this._client !== client) return
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
		const matched = this._client
			?.getEntitiesWithIds()
			.find((e) => e.id === event.entity || (e.type === event.type && e.name === event.entity))
		const entityId = matched?.id ?? event.entity
		this.latestState.set(entityId, event)
		this.emit('state', entityId, event.type)
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
		this._client.command(entityId as any, options)
	}

	latest(entityId: string): any {
		return this._client?.latest(entityId as any) ?? this.latestState.get(entityId) ?? null
	}

	on(eventName: string, callback: (...args: any[]) => void | Promise<void>): void {
		this._events.set(eventName, [...(this._events.get(eventName) || []), callback])
	}

	emit(eventName: string, ...args: any[]): void {
		const handlers = this._events.get(eventName)
		if (handlers) {
			for (const handler of handlers) {
				void handler(...args)
			}
		}
	}
}
