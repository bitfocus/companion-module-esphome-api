import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { FeedbackId } from '../util'
import BinarySensor from '../entities/BinarySensorEntity'
import { EntityPicker, OnOffPicker } from '../choices'

export const BinarySensorAdapter: EntityAdapter<BinarySensor> = {
	is: (instance: unknown): instance is BinarySensor => {
		return instance instanceof BinarySensor
	},

	createActions: (_client: EsphomeClient): CompanionActionDefinitions => {
		return {}
	},

	createFeedbacks: (client: EsphomeClient): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const entities = client.getAll(BinarySensorAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.BinarySensorState] = {
				type: 'boolean',
				name: 'Change from binary sensor state',
				description: 'If the binary sensor state matches the rule, change style of the bank',
				options: [EntityPicker(entities), OnOffPicker()],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const entity = client.getEntity(String(feedback.options.entity_id), BinarySensorAdapter)
					if (entity) {
						return entity.isOn === !!feedback.options.state
					}
					return false
				},
			}
		}
		return feedbacks
	},
}
