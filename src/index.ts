import InstanceSkel = require('../../../instance_skel')
import { CompanionConfigField, CompanionSystem } from '../../../instance_skel_types'
import { EsphomeClient } from './esphomeClient'
import { DeviceConfig, GetConfigFields } from './config'
import { GetActionsList } from './actions'
import { GetFeedbacksList } from './feedback'

class ESPHomeInstance extends InstanceSkel<DeviceConfig> {
	private readonly client: EsphomeClient = new EsphomeClient()
	constructor(system: CompanionSystem, id: string, config: DeviceConfig) {
		super(system, id, config)

		this.client.on('connected', () => {
			this.status(this.STATUS_OK, 'Connected')
		})

		this.client.on('disconnected', () => {
			this.status(this.STATUS_ERROR, 'Disconnected')
		})

		this.client.on('refreshEntities', () => {
			this.refreshCompanionInstances()
		})

		this.client.on('state', (entity) => {
			this.checkFeedbacks()
		})

		this.client.on('error', (err) => {
			this.status(this.STATUS_ERROR, err.message)
			this.log('error', 'ESPHome client error: ' + err.message)
		})
	}

	public config_fields(): CompanionConfigField[] {
		return GetConfigFields(this)
	}

	public init(): void {
		this.initClient()
	}

	private initClient() {
		if (this.config.host) {
			this.client.connect(this.config.host, this.config.port, this.config.password)
		} else {
			this.client.disconnect()
		}
	}

	private refreshCompanionInstances() {
		this.setActions(GetActionsList(this.client))
		this.setFeedbackDefinitions(GetFeedbacksList(this, this.client))
	}

	public updateConfig(config: DeviceConfig): void {
		let resetConnection = false

		if (this.config.host != config.host || this.config.port != config.port || this.config.password != config.password) {
			resetConnection = true
		}

		this.config = config

		if (resetConnection === true) {
			this.initClient()
		}
	}

	public destroy(): void {
		this.client.disconnect()
		this.debug('destroy', this.id)
	}
}

exports = module.exports = ESPHomeInstance
