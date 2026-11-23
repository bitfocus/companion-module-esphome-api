import { InstanceBase, InstanceStatus, type SomeCompanionConfigField } from '@companion-module/base'
import { EsphomeWrapper } from './esphomeWrapper.js'
import { ModuleConfig, GetConfigFields } from './config.js'
import { ActionsSchema, GetActionsList, UpdateActions } from './actions.js'
import { UpdateFeedbacks, GetFeedbacksList, type FeedbacksSchema } from './feedback.js'
import { UpdateVariableDefinitions, UpdateVariableValues, type VariablesSchema } from './variables.js'
import { UpdatePresets } from './presets.js'

export type ModuleSchema = {
	config: ModuleConfig
	secrets: undefined
	actions: ActionsSchema
	feedbacks: FeedbacksSchema
	variables: VariablesSchema
}

export default class ESPHomeInstance extends InstanceBase<ModuleSchema> {
	config!: ModuleConfig //setup in init()
	private readonly wrapper: EsphomeWrapper = new EsphomeWrapper('127.0.0.1', 6053)

	constructor(internal: unknown) {
		super(internal) // Call super FIRST - critical TypeScript rule!
		this.setupEventListeners()
	}

	setupEventListeners(): void {
		this.wrapper.on('connected', () => {
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

	async init(config: ModuleConfig, _isFirstInit?: boolean): Promise<void> {
		this.config = config
		this.updateActions()
		this.updateFeedbacks()
		this.updatePresets()
		this.updateVariableDefinitions()

		await this.connectClient(config)
	}

	private async connectClient(config: ModuleConfig): Promise<void> {
		if (!config.host) {
			this.wrapper.disconnect()
			this.updateStatus(InstanceStatus.BadConfig, 'Missing host')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		this.log('info', `Connecting to ESPHome at ${config.host}:${config.port || 6053}...`)
		try {
			await this.wrapper.connect(config.host, config.port || 6053, config.psk || undefined)
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err)
			this.log('error', `Failed to connect to ESPHome: ${message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, message)
		}
	}

	async destroy(): Promise<void> {
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

	async configUpdated(config: ModuleConfig): Promise<void> {
		const changed =
			!this.config ||
			this.config.host !== config.host ||
			this.config.port !== config.port ||
			this.config.psk !== config.psk

		this.config = config
		if (changed) {
			await this.connectClient(config)
		}
	}
}
