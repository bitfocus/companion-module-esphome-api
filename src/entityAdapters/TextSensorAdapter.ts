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
				options: [
					EntityPicker(textSensors),
					{
						type: 'dropdown',
						label: 'Match Type',
						id: 'matchType',
						default: 'eq',
						choices: [
							{ id: 'eq', label: 'Equals' },
							{ id: 'ne', label: 'Not Equals' },
							{ id: 'contains', label: 'Contains' },
							{ id: 'startsWith', label: 'Starts With' },
							{ id: 'regex', label: 'Regex' },
						],
					},
					{ type: 'textinput', label: 'Value', id: 'value', default: '' },
				],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.state === undefined) return false
					const current = String(event.state)
					const rawTarget = feedback.options.value
					const target =
						typeof rawTarget === 'string' || typeof rawTarget === 'number' || typeof rawTarget === 'boolean'
							? String(rawTarget)
							: ''
					switch (feedback.options.matchType) {
						case 'ne':
							return current !== target
						case 'contains':
							return current.includes(target)
						case 'startsWith':
							return current.startsWith(target)
						case 'regex':
							try {
								return new RegExp(target).test(current)
							} catch {
								return false
							}
						default:
							return current === target
					}
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
