import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { PermanentError } from 'esphome-client'
import { EsphomeWrapper } from './esphomeWrapper.js'
import { ModuleConfig, ModuleSecrets, GetConfigFields } from './config.js'
import { ActionsSchema, GetActionsList, UpdateActions } from './actions.js'
import { UpdateFeedbacks, GetFeedbacksList, type FeedbacksSchema } from './feedback.js'
import { UpdateVariableDefinitions, UpdateVariableValues, type VariablesSchema } from './variables.js'
import { UpdatePresets } from './presets.js'

const INITIAL_RETRY_DELAY_MS = 5_000
const MAX_RETRY_DELAY_MS = 60_000

export type ModuleSchema = {
	config: ModuleConfig
	secrets: ModuleSecrets
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export default class ESPHomeInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig //setup in init()
	secrets: ModuleSecrets = {}
	private readonly wrapper: EsphomeWrapper = new EsphomeWrapper('127.0.0.1', 6053)
	private reconnectTimer: ReturnType<typeof setTimeout> | undefined
	private retryDelayMs = INITIAL_RETRY_DELAY_MS
	private isDestroyed = false

	constructor(internal: unknown) {
		super(internal) // Call super FIRST - critical TypeScript rule!
		this.setupEventListeners()
	}

	setupEventListeners(): void {
		this.wrapper.on('connected', () => {
			this.resetReconnectBackoff()
			this.updateStatus(InstanceStatus.Ok)
		})

		this.wrapper.on('disconnected', (reason?: string) => {
			this.log('info', `Disconnected from ESPHome${reason ? `: ${reason}` : ''}`)
			this.updateStatus(InstanceStatus.Disconnected, reason)
		})

		this.wrapper.on('refreshEntities', async () => {
			await this.refreshCompanionInstances()
			this.checkAllFeedbacks()
		})

		this.wrapper.on('state', () => {
			UpdateVariableValues(this, this.wrapper)
			this.checkAllFeedbacks()
		})
	}

	updateFeedbacks(): void {
		UpdateFeedbacks(this)
	}

	updateActions(): void {
		UpdateActions(this)
	}

	updatePresets(): void {
		UpdatePresets(this, this.wrapper)
	}

	updateVariableDefinitions(): void {
		UpdateVariableDefinitions(this, this.wrapper)
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.config = config
		this.secrets = secrets ?? {}
		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()

		await this.connectClient(config, this.secrets)
	}

	private clearReconnectTimer(): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = undefined
		}
	}

	private resetReconnectBackoff(): void {
		this.clearReconnectTimer()
		this.retryDelayMs = INITIAL_RETRY_DELAY_MS
	}

	private scheduleReconnect(): void {
		if (this.isDestroyed || !this.config?.host || this.reconnectTimer) return

		const delay = this.retryDelayMs
		this.retryDelayMs = Math.min(this.retryDelayMs * 2, MAX_RETRY_DELAY_MS)
		this.log('debug', `Retrying ESPHome connection in ${Math.round(delay / 1000)}s...`)
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = undefined
			if (!this.isDestroyed) {
				void this.connectClient(this.config, this.secrets)
			}
		}, delay)
	}

	private async connectClient(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		this.clearReconnectTimer()

		if (!config.host) {
			this.wrapper.disconnect()
			this.updateStatus(InstanceStatus.BadConfig, 'Missing host')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		this.log('info', `Connecting to ESPHome at ${config.host}:${config.port || 6053}...`)
		try {
			await this.wrapper.connect(config.host, config.port || 6053, secrets.psk || undefined)
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			this.log('error', `Failed to connect to ESPHome: ${message}`)
			if (err instanceof PermanentError) {
				this.updateStatus(InstanceStatus.BadConfig, message)
				return
			}
			this.updateStatus(InstanceStatus.ConnectionFailure, message)
			this.scheduleReconnect()
		}
	}

	async destroy(): Promise<void> {
		this.isDestroyed = true
		this.clearReconnectTimer()
		this.wrapper.disconnect()
		this.log('debug', 'destroy')
	}

	private async refreshCompanionInstances(): Promise<void> {
		this.setActionDefinitions(GetActionsList(this.wrapper))
		this.setFeedbackDefinitions(GetFeedbacksList(this.wrapper))
		this.updatePresets()
		this.updateVariableDefinitions()
		UpdateVariableValues(this, this.wrapper)
	}

	async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		const nextSecrets = secrets ?? {}
		const changed =
			!this.config ||
			this.config.host !== config.host ||
			this.config.port !== config.port ||
			this.secrets.psk !== nextSecrets.psk

		this.config = config
		this.secrets = nextSecrets
		if (changed) {
			this.resetReconnectBackoff()
			await this.connectClient(config, nextSecrets)
		}
	}
}
