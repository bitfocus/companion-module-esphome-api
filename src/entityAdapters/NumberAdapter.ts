import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { NumberEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { PrefixedActionIds, FeedbackId } from '../util.js'

export const NumberAdapter: EntityAdapter<NumberEntity> = {
	is: (instance: unknown): instance is NumberEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'number'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const numberEntities = client.getAvailableEntityIds()['number'] || []
		if (numberEntities.length) {
			numberEntities.forEach((entityId: string) => {
				const entity = (client as any).getEntity(entityId)
				const step = entity?.step ?? 1
				const minValue = entity?.minValue ?? 0
				const maxValue = entity?.maxValue ?? 100

				actions[PrefixedActionIds.NumberState + entityId] = {
					name: `${entityId}: Set number state`,
					options: [
						{
							type: 'number',
							label: 'Value',
							id: 'value',
							default: minValue,
							min: minValue,
							max: maxValue,
							step: step,
							range: true,
						},
					],
					callback: (evt): void => {
						client.command((evt as any).options.entity_id, { state: Number((evt as any).options.value) })
					},
				}
			})
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const numbers = client.getAvailableEntityIds()['number'] || []
		if (numbers.length) {
			numbers.forEach((entityId: string) => {
				feedbacks[FeedbackId.NumberState + entityId] = {
					type: 'value',
					name: `${entityId}: Change from number state`,
					description: 'If the number state matches the rule, change style of the bank',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						{
							type: 'dropdown',
							label: 'Comparitor',
							id: 'comparitor',
							default: 'eq',
							choices: [
								{ id: 'eq', label: 'Equal' },
								{ id: 'ne', label: 'Not Equal' },
								{ id: 'gt', label: 'Greater Than' },
								{ id: 'gte', label: 'Greater or Equal' },
								{ id: 'lt', label: 'Less Than' },
								{ id: 'lte', label: 'Less or Equal' },
							],
						},
						{ type: 'number', label: 'Value', id: 'value', default: 0, min: -100, max: 100, step: 1 },
					],
					callback: (feedback): number | null => {
						const event = client.latest((feedback as any).options.entity_id)
						if (!event) return null
						return event.state === (feedback as any).options.value ? 1 : 0
					},
				}
			})
		}
		return feedbacks
	},
}
