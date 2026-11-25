import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { SensorEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { FeedbackId } from '../util.js'
import { EntityPicker, NumberComparitorPicker, NumberValuePicker, compareNumber } from '../choices.js'
import { entityVariableId } from '../variables.js'

export const SensorAdapter: EntityAdapter<SensorEntity> = {
	entityType: 'sensor',

	is: (instance: unknown): instance is SensorEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'sensor'
	},

	getFeedbackIds: (): string[] => [FeedbackId.SensorState],

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
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper, connLabel: string): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('sensor')) {
			const varId = entityVariableId(entity.id)
			const id = `preset_${varId}_display`
			presets[id] = makeSimplePreset(entity.name || entity.id, `${entity.name || entity.id}\n$(${connLabel}:${varId})`)
			ids.push(id)
		}
		return { sections: makePresetSection('sensors', 'Sensors', ids), presets }
	},
}
