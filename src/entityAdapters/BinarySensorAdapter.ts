import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { BinarySensorEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import {
	AdapterPresets,
	EntityAdapter,
	LayeredFeedback,
	makeLayeredFeedback,
	makeLayeredIconPreset,
	makePresetSection,
} from './base.js'
import { getMdiIconPng64 } from '../icons.js'
import { FeedbackId } from '../util.js'
import { EntityPicker, OnOffPicker } from '../choices.js'
import { entityVariableId } from '../variables.js'

const ACTIVITY_DEVICE_CLASSES = new Set([
	'light',
	'motion',
	'moving',
	'occupancy',
	'presence',
	'running',
	'sound',
	'vibration',
])

const ALERT_DEVICE_CLASSES = new Set([
	'battery',
	'carbon_monoxide',
	'gas',
	'heat',
	'lock',
	'moisture',
	'problem',
	'safety',
	'smoke',
	'tamper',
])

const OPENING_DEVICE_CLASSES = new Set(['door', 'garage_door', 'opening', 'window'])

const STATUS_DEVICE_CLASSES = new Set(['battery_charging', 'connectivity', 'plug', 'power', 'update'])

const DEVICE_CLASS_ICONS: Record<string, { inactive: string; active: string }> = {
	battery: { inactive: 'battery-outline', active: 'battery-alert' },
	battery_charging: { inactive: 'battery-charging-outline', active: 'battery-charging' },
	carbon_monoxide: { inactive: 'molecule-co', active: 'molecule-co' },
	cold: { inactive: 'snowflake-off', active: 'snowflake' },
	connectivity: { inactive: 'wifi-off', active: 'wifi' },
	door: { inactive: 'door-closed', active: 'door-open' },
	garage_door: { inactive: 'garage', active: 'garage-open' },
	gas: { inactive: 'gas-cylinder', active: 'gas-cylinder' },
	heat: { inactive: 'fire-off', active: 'fire' },
	light: { inactive: 'lightbulb-outline', active: 'lightbulb-on-outline' },
	lock: { inactive: 'lock', active: 'lock-open' },
	moisture: { inactive: 'water-off', active: 'water-alert' },
	motion: { inactive: 'motion-sensor-off', active: 'motion-sensor' },
	moving: { inactive: 'human-handsdown', active: 'run' },
	occupancy: { inactive: 'home-outline', active: 'home-account' },
	opening: { inactive: 'window-closed', active: 'window-open' },
	plug: { inactive: 'power-plug-off', active: 'power-plug' },
	power: { inactive: 'flash-off', active: 'flash' },
	presence: { inactive: 'account-off-outline', active: 'account-check' },
	problem: { inactive: 'check-circle-outline', active: 'alert-circle' },
	running: { inactive: 'stop-circle-outline', active: 'play-circle' },
	safety: { inactive: 'shield-check-outline', active: 'shield-alert' },
	smoke: { inactive: 'smoke-detector', active: 'smoke-detector-alert' },
	sound: { inactive: 'volume-off', active: 'volume-high' },
	tamper: { inactive: 'shield-alert-outline', active: 'shield-alert' },
	update: { inactive: 'package-variant', active: 'package-up' },
	vibration: { inactive: 'vibrate-off', active: 'vibrate' },
	window: { inactive: 'window-closed-variant', active: 'window-open-variant' },
}

function getBinarySensorPresetConfig(entity: BinarySensorEntity & { id: string }): {
	defaultIcon: string
	feedbacks: LayeredFeedback[]
} {
	const customIcon = entity.icon && getMdiIconPng64(entity.icon) ? entity.icon : undefined
	const pair = entity.deviceClass ? DEVICE_CLASS_ICONS[entity.deviceClass] : undefined
	const defaultIcon = customIcon ?? pair?.inactive ?? 'checkbox-marked-circle-outline'
	const activeIcon = customIcon ?? pair?.active ?? defaultIcon

	if (entity.deviceClass === 'connectivity') {
		return {
			defaultIcon,
			feedbacks: [
				makeLayeredFeedback({
					feedbackId: FeedbackId.BinarySensorState,
					options: { entity_id: entity.id, state: true },
					bgcolor: combineRgb(0, 255, 0),
					icon: activeIcon,
				}),
				makeLayeredFeedback({
					feedbackId: FeedbackId.BinarySensorState,
					options: { entity_id: entity.id, state: false },
					bgcolor: combineRgb(200, 0, 0),
					icon: defaultIcon,
				}),
			],
		}
	}

	let activeBg = combineRgb(0, 255, 0)
	if (entity.deviceClass && ALERT_DEVICE_CLASSES.has(entity.deviceClass)) {
		activeBg = combineRgb(200, 0, 0)
	} else if (entity.deviceClass && OPENING_DEVICE_CLASSES.has(entity.deviceClass)) {
		activeBg = combineRgb(255, 191, 0)
	} else if (entity.deviceClass && ACTIVITY_DEVICE_CLASSES.has(entity.deviceClass)) {
		activeBg = combineRgb(0, 200, 255)
	} else if (entity.deviceClass && STATUS_DEVICE_CLASSES.has(entity.deviceClass)) {
		activeBg = combineRgb(0, 255, 0)
	} else if (entity.deviceClass === 'cold') {
		activeBg = combineRgb(0, 120, 255)
	}

	return {
		defaultIcon,
		feedbacks: [
			makeLayeredFeedback({
				feedbackId: FeedbackId.BinarySensorState,
				options: { entity_id: entity.id, state: true },
				bgcolor: activeBg,
				icon: activeIcon,
			}),
		],
	}
}

export const BinarySensorAdapter: EntityAdapter<BinarySensorEntity> = {
	entityType: 'binary_sensor',

	is: (instance: unknown): instance is BinarySensorEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'binary_sensor'
	},

	getFeedbackIds: (): string[] => [FeedbackId.BinarySensorState],

	createActions: (_client: EsphomeWrapper): CompanionActionDefinitions => {
		return {}
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const binarySensors = client.getEntities('binary_sensor')
		if (binarySensors.length) {
			feedbacks[FeedbackId.BinarySensorState] = {
				type: 'boolean',
				name: 'Change from binary sensor state',
				description: 'True when the binary sensor state matches the rule',
				options: [EntityPicker(binarySensors), OnOffPicker()],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					return Boolean(event.state) === Boolean(feedback.options.state)
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper, connLabel: string): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('binary_sensor')) {
			const binaryEntity = entity as unknown as BinarySensorEntity & { id: string }
			const varId = entityVariableId(binaryEntity.id)
			const id = `preset_${varId}_display`
			const { defaultIcon, feedbacks } = getBinarySensorPresetConfig(binaryEntity)
			presets[id] = makeLayeredIconPreset({
				name: binaryEntity.name || binaryEntity.id,
				text: `${binaryEntity.name || binaryEntity.id}\n$(${connLabel}:${varId})`,
				icon: defaultIcon,
				feedbacks,
			})
			ids.push(id)
		}
		return { sections: makePresetSection('binary_sensors', 'Binary Sensors', ids), presets }
	},
}
