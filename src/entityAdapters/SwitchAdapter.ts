import InstanceSkel from '../../../../instance_skel'
import { CompanionActions, CompanionFeedbacks } from '../../../../instance_skel_types'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { ActionId, FeedbackId, OnOffToggle } from '../util'
import Switch from '../entities/SwitchEntity'
import { EntityPicker, OnOffPicker, OnOffTogglePicker } from '../choices'

export const SwitchAdapter: EntityAdapter<Switch> = {
	is: (instance: any): instance is Switch => {
		return instance instanceof Switch
	},

	createActions: (client: EsphomeClient): CompanionActions => {
		const actions: CompanionActions = {}
		const switchEntities = client.getAll(SwitchAdapter)
		if (switchEntities.length) {
			actions[ActionId.SwitchState] = {
				label: 'Set switch state',
				options: [EntityPicker(switchEntities), OnOffTogglePicker()],
				callback: (evt): void => {
					const id = evt.options.entity_id as string
					const e = client.getEntity(id, SwitchAdapter)
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
		const entities = client.getAll(SwitchAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.SwitchState] = {
				type: 'boolean',
				label: 'Change from switch state',
				description: 'If the switch state matches the rule, change style of the bank',
				options: [EntityPicker(entities), OnOffPicker()],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const entity = client.getEntity(String(feedback.options.entity_id), SwitchAdapter)
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
