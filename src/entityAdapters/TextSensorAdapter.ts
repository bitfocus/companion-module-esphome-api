import InstanceSkel from '../../../../instance_skel'
import { CompanionActions, CompanionFeedbacks } from '../../../../instance_skel_types'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { FeedbackId } from '../util'
import TextSensor from '../entities/TextSensorEntity'
import { EntityPicker } from '../choices'

export const TextSensorAdapter: EntityAdapter<TextSensor> = {
	is: (instance: any): instance is TextSensor => {
		return instance instanceof TextSensor
	},

	createActions: (client: EsphomeClient): CompanionActions => {
		return {}
	},

	createFeedbacks: (instance: InstanceSkel<any>, client: EsphomeClient): CompanionFeedbacks => {
		const feedbacks: CompanionFeedbacks = {}
		const entities = client.getAll(TextSensorAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.TextSensorValue] = {
				type: 'boolean',
				label: 'Change from text sensor state',
				description: 'If the text sensor state matches the rule, change style of the bank',
				options: [
					EntityPicker(entities),
					{
						type: 'textinput',
						id: 'state',
						label: 'State Value',
						required: true,
						regex: instance.REGEX_SOMETHING,
					},
				],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const entity = client.getEntity(String(feedback.options.entity_id), TextSensorAdapter)
					if (entity) {
						return entity.state == feedback.options.state
					}
					return false
				},
			}
		}
		return feedbacks
	},
}
