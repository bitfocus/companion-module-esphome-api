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
			try {
				this.refreshCompanionInstances()
			} catch (error) {
				this.log('error', 'Refresh entities error: ' + (error as Error).message)
			}
		})

		this.client.on('state', () => {
			this.checkFeedbacks()
			this.updateVariableValues()
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
		try {
			await this.initClient(config)
		} catch (error) {
			this.log('error', 'Init error: ' + (error as Error).message)
			throw error
		}
	}

	private async initClient(config: DeviceConfig) {
		if (config.host) {
			await this.client.connect(config.host, config.port, config.encryptionKey)
		} else {
			this.client.disconnect()
		}
	}

	private refreshCompanionInstances() {
		this.setActionDefinitions(GetActionsList(this.client))
		this.setFeedbackDefinitions(GetFeedbacksList(this.client))
		
		// Set up variables from sensor entities
		const variableDefinitions: any[] = []
		
		// Sensor variables
		const sensors = this.client.getAll('sensor')
		sensors.forEach((sensor) => {
			variableDefinitions.push({
				name: `${sensor.name} (Sensor)`,
				variableId: `sensor_${sensor.id}`,
			})
		})
		
		// Binary sensor variables
		const binarySensors = this.client.getAll('binary_sensor')
		binarySensors.forEach((sensor) => {
			variableDefinitions.push({
				name: `${sensor.name} (Binary Sensor)`,
				variableId: `binary_sensor_${sensor.id}`,
			})
		})
		
		// Text sensor variables
		const textSensors = this.client.getAll('text_sensor')
		textSensors.forEach((sensor) => {
			variableDefinitions.push({
				name: `${sensor.name} (Text Sensor)`,
				variableId: `text_sensor_${sensor.id}`,
			})
		})
		
		if (variableDefinitions.length > 0) {
			this.setVariableDefinitions(variableDefinitions)
		}
		
		// Update variable values
		this.updateVariableValues()
	}

	private updateVariableValues() {
		const sensors = this.client.getAll('sensor')
		sensors.forEach((sensor) => {
			this.setVariableValues({ [`sensor_${sensor.id}`]: sensor.state?.state?.toString() || '' })
		})
		
		const binarySensors = this.client.getAll('binary_sensor')
		binarySensors.forEach((sensor) => {
			this.setVariableValues({ [`binary_sensor_${sensor.id}`]: sensor.state?.state ? 'true' : 'false' })
		})
		
		const textSensors = this.client.getAll('text_sensor')
		textSensors.forEach((sensor) => {
			this.setVariableValues({ [`text_sensor_${sensor.id}`]: sensor.state?.state?.toString() || '' })
		})
	}

	public async configUpdated(config: DeviceConfig): Promise<void> {
		let resetConnection = false

		if (!this.config
			|| this.config.host != config.host
			|| this.config.port != config.port
			|| this.config.encryptionKey != config.encryptionKey) {
			resetConnection = true
		}

		this.config = config

		if (resetConnection === true) {
			await this.initClient(config);
		}
	}

	public async destroy(): Promise<void> {
		this.client.disconnect()
		this.log('debug', 'destroy')
	}
}

runEntrypoint(ESPHomeInstance, [])
