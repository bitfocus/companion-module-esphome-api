import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { PrefixedActionIds, FeedbackId } from '../util'
import Cover from '../entities/CoverEntity'
import { EntityPicker } from '../choices'

export const CoverAdapter: EntityAdapter<Cover> = {
	is: (instance: any): instance is Cover => {
		return instance instanceof Cover
	},

	createActions: (client: EsphomeClient): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		client.getAll(CoverAdapter).forEach((cover) => {
			actions[PrefixedActionIds.CoverPosition + cover.id] = {
				name: `${cover.name}: Set cover position`,
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

	createFeedbacks: (client: EsphomeClient): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const entities = client.getAll(CoverAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.CoverOpen] = {
				type: 'boolean',
				name: 'Change from cover open',
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
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
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
