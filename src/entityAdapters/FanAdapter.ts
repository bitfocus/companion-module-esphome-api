import InstanceSkel from '../../../../instance_skel'
import { CompanionActions, CompanionFeedbacks } from '../../../../instance_skel_types'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { ActionId, FeedbackId, OnOffToggle } from '../util'
import Fan from '../entities/FanEntity'
import { EntityPicker, OnOffPicker, OnOffTogglePicker } from '../choices'

export const FanAdapter: EntityAdapter<Fan> = {
	is: (instance: any): instance is Fan => {
		return instance instanceof Fan
	},

	createActions: (client: EsphomeClient): CompanionActions => {
		const actions: CompanionActions = {}
		const fanEntities = client.getAll(FanAdapter)
		if (fanEntities.length) {
			actions[ActionId.FanState] = {
				label: 'Set fan state',
				options: [EntityPicker(fanEntities), OnOffTogglePicker()],
				callback: (evt): void => {
					const id = evt.options.entity_id as string
					const e = client.getEntity(id, FanAdapter)
					if (!e) return
					let newState: boolean
					switch (evt.options.state as OnOffToggle) {
						case OnOffToggle.Off:
							newState = false
							break
						case OnOffToggle.Toggle:
							newState = !e.isOn
							break
						default:
							newState = true
							break
					}
					e.setState(newState)
				},
			}
		}
		return actions
	},

	createFeedbacks: (instance: InstanceSkel<any>, client: EsphomeClient): CompanionFeedbacks => {
		const feedbacks: CompanionFeedbacks = {}
		const entities = client.getAll(FanAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.FanState] = {
				type: 'boolean',
				label: 'Change from fan state',
				description: 'If the fan state matches the rule, change style of the bank',
				options: [EntityPicker(entities), OnOffPicker()],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const entity = client.getEntity(String(feedback.options.entity_id), FanAdapter)
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
