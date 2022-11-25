import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { FeedbackId } from '../util'
import Sensor from '../entities/SensorEntity'
import { compareNumber, EntityPicker, NumberComparitorPicker, NumberValuePicker } from '../choices'

export const SensorAdapter: EntityAdapter<Sensor> = {
	is: (instance: unknown): instance is Sensor => {
		return instance instanceof Sensor
	},

	createActions: (_client: EsphomeClient): CompanionActionDefinitions => {
		return {}
	},

	createFeedbacks: (client: EsphomeClient): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const entities = client.getAll(SensorAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.SensorState] = {
				type: 'boolean',
				name: 'Change from sensor state',
				description: 'If the sensor state matches the rule, change style of the bank',
				options: [EntityPicker(entities), NumberComparitorPicker(), NumberValuePicker()],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const entity = client.getEntity(String(feedback.options.entity_id), SensorAdapter)
					if (entity) {
						return compareNumber(feedback.options.value, feedback.options.comparitor, entity.state)
					}
					return false
				},
			}
		}
		return feedbacks
	},
}
