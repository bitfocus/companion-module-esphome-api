import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { BinarySensorEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { FeedbackId } from '../util.js'
import { EntityPicker, OnOffPicker } from '../choices.js'
import { entityVariableId } from '../variables.js'

export const BinarySensorAdapter: EntityAdapter<BinarySensorEntity> = {
	is: (instance: unknown): instance is BinarySensorEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'binary_sensor'
	},

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
			const varId = entityVariableId(entity.id)
			const id = `preset_${varId}_display`
			presets[id] = makeSimplePreset(
				entity.name || entity.id,
				`${entity.name || entity.id}\n$(${connLabel}:${varId})`,
				[],
				[
					{
						feedbackId: FeedbackId.BinarySensorState,
						options: { entity_id: entity.id, state: true },
						style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					},
				],
			)
			ids.push(id)
		}
		return { sections: makePresetSection('binary_sensors', 'Binary Sensors', ids), presets }
	},
}
