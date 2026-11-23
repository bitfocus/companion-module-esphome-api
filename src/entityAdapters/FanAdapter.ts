import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { FanEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { ActionId, FeedbackId, OnOffToggle } from '../util.js'
import { OnOffTogglePicker, OnOffPicker } from '../choices.js'

export const FanAdapter: EntityAdapter<FanEntity> = {
	is: (instance: unknown): instance is FanEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'fan'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const fanEntities = client.getAvailableEntityIds()['fan'] || []
		if (fanEntities.length) {
			fanEntities.forEach((entityId: string) => {
				actions[ActionId.FanState + entityId] = {
					name: `${entityId}: Set fan state`,
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						OnOffTogglePicker(),
					],
					callback: (evt): void => {
						const commandOptions: any = {}
						if (evt.options.state === OnOffToggle.Toggle) {
							commandOptions.toggle = true
						} else {
							commandOptions.state = evt.options.state === OnOffToggle.On
						}
						client.command(evt.options.entity_id as string, commandOptions)
					},
				}
			})
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const fans = client.getAvailableEntityIds()['fan'] || []
		if (fans.length) {
			fans.forEach((entityId: string) => {
				feedbacks[FeedbackId.FanState + entityId] = {
					type: 'boolean',
					name: `${entityId}: Change from fan state`,
					description: 'True when the fan state matches the rule',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						OnOffPicker(),
					],
					defaultStyle: {
						color: combineRgb(0, 0, 0),
						bgcolor: combineRgb(0, 255, 0),
					},
					callback: (feedback): boolean => {
						const event = client.latest(feedback.options.entity_id as string)
						if (!event) return false
						return Boolean(event.state) === Boolean(feedback.options.state)
					},
				}
			})
		}
		return feedbacks
	},
}
