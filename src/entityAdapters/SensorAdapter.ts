import InstanceSkel from '../../../../instance_skel'
import { CompanionActions, CompanionFeedbacks } from '../../../../instance_skel_types'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { FeedbackId } from '../util'
import Sensor from '../entities/SensorEntity'
import { compareNumber, EntityPicker, NumberComparitorPicker, NumberValuePicker } from '../choices'

export const SensorAdapter: EntityAdapter<Sensor> = {
	is: (instance: any): instance is Sensor => {
		return instance instanceof Sensor
	},

	createActions: (client: EsphomeClient): CompanionActions => {
		return {}
	},

	createFeedbacks: (instance: InstanceSkel<any>, client: EsphomeClient): CompanionFeedbacks => {
		const feedbacks: CompanionFeedbacks = {}
		const entities = client.getAll(SensorAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.SensorState] = {
				type: 'boolean',
				label: 'Change from sensor state',
				description: 'If the sensor state matches the rule, change style of the bank',
				options: [EntityPicker(entities), NumberComparitorPicker(), NumberValuePicker()],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
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
