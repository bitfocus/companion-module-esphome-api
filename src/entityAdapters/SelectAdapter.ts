import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { SelectEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { PrefixedActionIds, PrefixedFeedbackIds } from '../util.js'

export const SelectAdapter: EntityAdapter<SelectEntity> = {
	is: (instance: unknown): instance is SelectEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'select'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const selectEntities = client.getAvailableEntityIds()['select'] || []
		if (selectEntities.length) {
			selectEntities.forEach((entityId: string) => {
				const entity = (client as any).getEntity(entityId)
				const options = entity?.options ?? []
				const optionChoices = options.map((o: any) => ({ id: o, label: o }))

				actions[PrefixedActionIds.SelectState + entityId] = {
					name: `${entityId}: Set select state`,
					options: [
						{
							type: 'dropdown',
							label: 'State',
							id: 'state',
							default: options[0]?.id,
							choices: optionChoices,
						},
					],
					callback: (evt): void => {
						client.command((evt as any).options.entity_id, { option: (evt as any).options.state })
					},
				}
			})
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const selects = client.getAvailableEntityIds()['select'] || []
		if (selects.length) {
			selects.forEach((entityId: string) => {
				const entity = (client as any).getEntity(entityId)
				const options = entity?.options ?? []
				const optionChoices = options.map((o: any) => ({ id: o, label: o }))

				feedbacks[PrefixedFeedbackIds.SelectState + entityId] = {
					type: 'value',
					name: `${entityId}: Change from select state`,
					description: 'If the select state matches the rule, change style of the bank',
					options: [
						{
							type: 'dropdown',
							label: 'State',
							id: 'state',
							default: options[0]?.id,
							choices: optionChoices,
						},
					],
					callback: (feedback): string | null => {
						const event = client.latest((feedback as any).options.entity_id)
						if (!event) return null
						return event.state === (feedback as any).options.state ? (feedback as any).options.state : null
					},
				}
			})
		}
		return feedbacks
	},
}
