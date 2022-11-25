import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { PrefixedActionIds, FeedbackId } from '../util'
import NumberEntity from '../entities/NumberEntity'
import { compareNumber, EntityPicker, NumberComparitorPicker, NumberValuePicker } from '../choices'

export const NumberAdapter: EntityAdapter<NumberEntity> = {
	is: (instance: any): instance is NumberEntity => {
		return instance instanceof NumberEntity
	},

	createActions: (client: EsphomeClient): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		client.getAll(NumberAdapter).forEach((numberEntity) => {
			actions[PrefixedActionIds.NumberState + numberEntity.id] = {
				name: `${numberEntity.name}: Set number state`,
				options: [
					{
						type: 'number',
						label: 'Value',
						id: 'value',
						default: numberEntity.minValue,
						min: numberEntity.minValue,
						max: numberEntity.maxValue,
						step: numberEntity.step,
						range: true,
					},
				],
				callback: (evt): void => {
					numberEntity.setState(Number(evt.options.value))
				},
			}
		})
		return actions
	},

	createFeedbacks: (client: EsphomeClient): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const entities = client.getAll(NumberAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.NumberState] = {
				type: 'boolean',
				name: 'Change from number state',
				description: 'If the number state matches the rule, change style of the bank',
				options: [
					EntityPicker(entities),
					NumberComparitorPicker(),
					NumberValuePicker(),
				],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const entity = client.getEntity(String(feedback.options.entity_id), NumberAdapter)
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
