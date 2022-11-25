import { InstanceBase, InstanceStatus, SomeCompanionConfigField, runEntrypoint } from '@companion-module/base'
import { EsphomeClient } from './esphomeClient'
import { DeviceConfig, GetConfigFields } from './config'
import { GetActionsList } from './actions'
import { GetFeedbacksList } from './feedback'

class ESPHomeInstance extends InstanceBase<DeviceConfig> {
	private readonly client: EsphomeClient = new EsphomeClient()
	private config?: DeviceConfig

	constructor(internal: unknown) {
		super(internal)

		this.client.on('connected', () => {
			this.updateStatus(InstanceStatus.Ok)
		})

		this.client.on('disconnected', () => {
			this.updateStatus(InstanceStatus.Disconnected)
		})

		this.client.on('refreshEntities', () => {
			this.refreshCompanionInstances()
		})

		this.client.on('state', (_entity) => {
			this.checkFeedbacks()
		})

		this.client.on('warn', (msg) => {
			this.log('warn', msg);
		});

		this.client.on('error', (err) => {
			this.updateStatus(InstanceStatus.UnknownError, err.message)
			this.log('error', 'ESPHome client error: ' + err.message)
		})
	}

	public getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	public async init(config: DeviceConfig): Promise<void> {
		this.config = config
		this.initClient(config)
	}

	private initClient(config: DeviceConfig) {
		if (config.host) {
			this.client.connect(config.host, config.port, config.password)
		} else {
			this.client.disconnect()
		}
	}

	private refreshCompanionInstances() {
		this.setActionDefinitions(GetActionsList(this.client))
		this.setFeedbackDefinitions(GetFeedbacksList(this.client))
	}

	public async configUpdated(config: DeviceConfig): Promise<void> {
		let resetConnection = false

		if (!this.config
			|| this.config.host != config.host
			|| this.config.port != config.port
			|| this.config.password != config.password) {
			resetConnection = true
		}

		this.config = config

		if (resetConnection === true) {
			this.initClient(config);
		}
	}

	public async destroy(): Promise<void> {
		this.client.disconnect()
		this.log('debug', 'destroy')
	}
}

runEntrypoint(ESPHomeInstance, [])
