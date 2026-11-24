import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { TextSensorEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { FeedbackId } from '../util.js'
import { EntityPicker } from '../choices.js'
import { entityVariableId } from '../variables.js'

export const TextSensorAdapter: EntityAdapter<TextSensorEntity> = {
	entityType: 'text_sensor',

	is: (instance: unknown): instance is TextSensorEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'text_sensor'
	},

	getFeedbackIds: (): string[] => [FeedbackId.TextSensorValue],

	createActions: (_client: EsphomeWrapper): CompanionActionDefinitions => {
		return {}
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const textSensors = client.getEntities('text_sensor')
		if (textSensors.length) {
			feedbacks[FeedbackId.TextSensorValue] = {
				type: 'boolean',
				name: 'Change from text sensor value',
				description: 'True when the text sensor value matches the rule',
				options: [EntityPicker(textSensors), { type: 'textinput', label: 'Value', id: 'value', default: '' }],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					return event.state === feedback.options.value
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper, connLabel: string): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('text_sensor')) {
			const varId = entityVariableId(entity.id)
			const id = `preset_${varId}_display`
			presets[id] = makeSimplePreset(entity.name || entity.id, `${entity.name || entity.id}\n$(${connLabel}:${varId})`)
			ids.push(id)
		}
		return { sections: makePresetSection('text_sensors', 'Text Sensors', ids), presets }
	},
}
