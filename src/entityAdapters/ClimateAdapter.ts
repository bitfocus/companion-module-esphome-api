import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { ClimateEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { FeedbackId, PrefixedActionIds } from '../util.js'
import { ClimateModePicker, AllClimateModes } from '../choices.js'

export const ClimateAdapter: EntityAdapter<ClimateEntity> = {
	is: (instance: unknown): instance is ClimateEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'climate'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const climateEntities = client.getAvailableEntityIds()['climate'] || []
		if (climateEntities.length) {
			climateEntities.forEach((entityId: string) => {
				actions[PrefixedActionIds.ClimateMode + entityId] = {
					name: `${entityId}: Set climate mode`,
					options: [ClimateModePicker(AllClimateModes)],
					callback: (evt): void => {
						client.command(evt.options.entity_id as string, { mode: evt.options.mode })
					},
				}
			})
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const climates = client.getAvailableEntityIds()['climate'] || []
		if (climates.length) {
			climates.forEach((entityId: string) => {
				feedbacks[FeedbackId.ClimateMode + entityId] = {
					type: 'boolean',
					name: `${entityId}: Change from climate mode`,
					description: 'If the climate mode matches the rule, change style of the bank',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						ClimateModePicker(AllClimateModes),
					],
					defaultStyle: {
						color: 0,
						bgcolor: 16777215,
					},
					callback: (feedback): boolean => {
						const event = client.latest(feedback.options.entity_id as string)
						if (!event) return false
						return event.mode === feedback.options.mode
					},
				}
			})
		}
		return feedbacks
	},
}
