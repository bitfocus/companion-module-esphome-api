import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { SensorEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makeLayeredIconPreset, makePresetSection } from './base.js'
import { getMdiIconPng64 } from '../icons.js'
import { FeedbackId } from '../util.js'
import { EntityPicker, NumberComparitorPicker, NumberValuePicker, compareNumber } from '../choices.js'
import { entityVariableId } from '../variables.js'

const SENSOR_DEVICE_CLASS_ICONS: Record<string, string> = {
	apparent_power: 'flash',
	atmospheric_pressure: 'gauge',
	battery: 'percent',
	carbon_dioxide: 'molecule-co2',
	carbon_monoxide: 'molecule-co',
	current: 'current-ac',
	distance: 'ruler',
	duration: 'clock-outline',
	energy: 'lightning-bolt',
	frequency: 'sine-wave',
	humidity: 'water-percent',
	illuminance: 'weather-sunny',
	moisture: 'water-percent',
	power: 'flash',
	pressure: 'gauge',
	reactive_power: 'flash',
	signal_strength: 'wifi',
	speed: 'weather-windy',
	temperature: 'thermometer',
	voltage: 'sine-wave',
	wind_speed: 'weather-windy',
}

function getSensorIcon(entity: SensorEntity): string {
	if (entity.icon && getMdiIconPng64(entity.icon)) {
		return entity.icon
	}
	if (entity.deviceClass && SENSOR_DEVICE_CLASS_ICONS[entity.deviceClass]) {
		return SENSOR_DEVICE_CLASS_ICONS[entity.deviceClass]
	}
	const unit = entity.unitOfMeasurement?.trim()
	if (unit === '°C' || unit === '°F' || unit === 'K') return 'thermometer'
	if (unit === '%') return 'percent'
	return 'gauge'
}

export const SensorAdapter: EntityAdapter<SensorEntity> = {
	entityType: 'sensor',

	is: (instance: unknown): instance is SensorEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'sensor'
	},

	getFeedbackIds: (): string[] => [FeedbackId.SensorState, FeedbackId.SensorValue],

	createActions: (_client: EsphomeWrapper): CompanionActionDefinitions => {
		return {}
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const sensors = client.getEntities('sensor')
		if (sensors.length) {
			feedbacks[FeedbackId.SensorState] = {
				type: 'boolean',
				name: 'Change from sensor state',
				description: 'True when the sensor state matches the rule',
				options: [EntityPicker(sensors), NumberComparitorPicker(), NumberValuePicker()],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.state === undefined) return false
					return compareNumber(feedback.options.value, feedback.options.comparitor, Number(event.state))
				},
			}

			feedbacks[FeedbackId.SensorValue] = {
				type: 'value',
				name: 'Sensor value',
				description: 'Outputs the current numeric value of the sensor',
				options: [EntityPicker(sensors)],
				callback: (feedback): number => {
					const entityId = feedback.options.entity_id as string
					const event = client.latest(entityId)
					if (!event || event.state === undefined) return 0
					const num = Number(event.state)
					if (Number.isNaN(num)) return 0
					const entity = client.getEntity(entityId) as (SensorEntity & { id: string }) | undefined
					const decimals = typeof entity?.accuracyDecimals === 'number' ? entity.accuracyDecimals : -1
					return decimals >= 0 ? Number(num.toFixed(decimals)) : num
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper, connLabel: string): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('sensor')) {
			const sensorEntity = entity as unknown as SensorEntity & { id: string }
			const varId = entityVariableId(sensorEntity.id)
			const id = `preset_${varId}_display`
			const unit = sensorEntity.unitOfMeasurement ? ` ${sensorEntity.unitOfMeasurement}` : ''
			const isPercent =
				sensorEntity.unitOfMeasurement?.trim() === '%' ||
				sensorEntity.deviceClass === 'battery' ||
				sensorEntity.deviceClass === 'humidity' ||
				sensorEntity.deviceClass === 'moisture'

			const batteryStops = [
				{ value: 0, color: combineRgb(200, 0, 0), gradient: false },
				{ value: 20, color: combineRgb(255, 191, 0), gradient: true },
				{ value: 50, color: combineRgb(0, 200, 0), gradient: true },
			]

			presets[id] = makeLayeredIconPreset({
				name: sensorEntity.name || sensorEntity.id,
				text: `${sensorEntity.name || sensorEntity.id}\n$(${connLabel}:${varId})${unit}`,
				icon: getSensorIcon(sensorEntity),
				...(isPercent
					? {
							gauge: {
								value: { isExpression: true, value: '$(local:sensor_value)' },
								min: 0,
								max: 100,
								...(sensorEntity.deviceClass === 'battery' ? { stops: batteryStops } : {}),
							},
							localVariables: [
								{
									variableType: 'feedback',
									variableName: 'sensor_value',
									feedbackId: FeedbackId.SensorValue,
									options: { entity_id: sensorEntity.id },
								},
							],
						}
					: {}),
			})
			ids.push(id)
		}
		return { sections: makePresetSection('sensors', 'Sensors', ids), presets }
	},
}
