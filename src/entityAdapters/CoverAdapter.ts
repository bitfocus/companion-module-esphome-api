import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { CoverEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { PrefixedActionIds, FeedbackId } from '../util.js'

export const CoverAdapter: EntityAdapter<CoverEntity> = {
	is: (instance: unknown): instance is CoverEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'cover'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const coverEntities = client.getAvailableEntityIds()['cover'] || []
		if (coverEntities.length) {
			coverEntities.forEach((entityId: string) => {
				actions[PrefixedActionIds.CoverPosition + entityId] = {
					name: `${entityId}: Set cover position`,
					options: [
						{
							type: 'number',
							label: 'Position (0=Closed, 1=Open)',
							id: 'value',
							default: 0,
							min: 0,
							max: 1,
							step: 0.01,
							range: true,
						},
					],
					callback: (evt): void => {
						client.command(evt.options.entity_id as string, { position: Number(evt.options.value) })
					},
				}
			})
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const covers = client.getAvailableEntityIds()['cover'] || []
		if (covers.length) {
			covers.forEach((entityId: string) => {
				feedbacks[FeedbackId.CoverOpen + entityId] = {
					type: 'boolean',
					name: `${entityId}: Change from cover open`,
					description: 'True when the cover open state matches the rule',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
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
						const event = client.latest(feedback.options.entity_id as string)
						if (!event) return false
						const isOpen = event.position !== undefined ? event.position > 0 : Boolean(event.isOpen)
						return isOpen === Boolean(feedback.options.open)
					},
				}
			})
		}
		return feedbacks
	},
}
