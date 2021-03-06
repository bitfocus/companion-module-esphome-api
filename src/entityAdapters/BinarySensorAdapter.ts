import InstanceSkel from '../../../../instance_skel'
import { CompanionActions, CompanionFeedbacks } from '../../../../instance_skel_types'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { FeedbackId } from '../util'
import BinarySensor from '../entities/BinarySensorEntity'
import { EntityPicker, OnOffPicker } from '../choices'

export const BinarySensorAdapter: EntityAdapter<BinarySensor> = {
	is: (instance: any): instance is BinarySensor => {
		return instance instanceof BinarySensor
	},

	createActions: (client: EsphomeClient): CompanionActions => {
		return {}
	},

	createFeedbacks: (instance: InstanceSkel<any>, client: EsphomeClient): CompanionFeedbacks => {
		const feedbacks: CompanionFeedbacks = {}
		const entities = client.getAll(BinarySensorAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.BinarySensorState] = {
				type: 'boolean',
				label: 'Change from binary sensor state',
				description: 'If the binary sensor state matches the rule, change style of the bank',
				options: [EntityPicker(entities), OnOffPicker()],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
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
