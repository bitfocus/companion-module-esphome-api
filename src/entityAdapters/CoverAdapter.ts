import InstanceSkel from '../../../../instance_skel'
import { CompanionActions, CompanionFeedbacks } from '../../../../instance_skel_types'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { PrefixedActionIds, FeedbackId } from '../util'
import Cover from '../entities/CoverEntity'
import { EntityPicker } from '../choices'

export const CoverAdapter: EntityAdapter<Cover> = {
	is: (instance: any): instance is Cover => {
		return instance instanceof Cover
	},

	createActions: (client: EsphomeClient): CompanionActions => {
		const actions: CompanionActions = {}
		client.getAll(CoverAdapter).forEach((cover) => {
			actions[PrefixedActionIds.CoverPosition + cover.id] = {
				label: `${cover.name}: Set cover position`,
				options: [
					{
						type: 'number',
						label: 'Position (0=Closed, 1=Open)',
						id: 'value',
						default: 0,
						min: 0,
						max: 1,
						step: cover.supportsPosition ? 0.01 : 1,
						range: true,
					},
				],
				callback: (evt): void => {
					cover.setPosition(Number(evt.options.value))
				},
			}
		})
		return actions
	},

	createFeedbacks: (instance: InstanceSkel<any>, client: EsphomeClient): CompanionFeedbacks => {
		const feedbacks: CompanionFeedbacks = {}
		const entities = client.getAll(CoverAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.CoverOpen] = {
				type: 'boolean',
				label: 'Change from cover open',
				description: 'If the cover open matches the rule, change style of the bank',
				options: [
					EntityPicker(entities),
					{
						type: 'checkbox',
						label: 'Open',
						id: 'open',
						default: true,
					},
				],
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const entity = client.getEntity(String(feedback.options.entity_id), CoverAdapter)
					if (entity) {
						return entity.isOpen === !!feedback.options.open
					}
					return false
				},
			}
		}
		return feedbacks
	},
}
