import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { SwitchEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { ActionId, FeedbackId } from '../util.js'

export const SwitchAdapter: EntityAdapter<SwitchEntity> = {
	is: (instance: unknown): instance is SwitchEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'switch'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const switchEntities = client.getAvailableEntityIds()['switch'] || []
		if (switchEntities.length) {
			switchEntities.forEach((entityId: string) => {
				actions[ActionId.SwitchState] = {
					name: 'Set switch state',
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
							label: 'State',
							id: 'state',
							default: 'on',
							choices: [
								{ id: 'on', label: 'On' },
								{ id: 'off', label: 'Off' },
								{ id: 'toggle', label: 'Toggle' },
							],
						},
					],
					callback: (evt): void => {
						const commandOptions: any = {}
						if ((evt as any).options.state === 'toggle') {
							commandOptions.toggle = true
						} else {
							commandOptions.state = (evt as any).options.state === 'on'
						}
						client.command((evt as any).options.entity_id, commandOptions)
					},
				}
			})
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const switches = client.getAvailableEntityIds()['switch'] || []
		if (switches.length) {
			switches.forEach((entityId: string) => {
				feedbacks[FeedbackId.SwitchState] = {
					type: 'boolean',
					name: 'Change from switch state',
					description: 'If the switch state matches the rule, change style of the bank',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						{ type: 'checkbox', label: 'State', id: 'state', default: true },
					],
					defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					callback: (feedback): boolean => {
						const event = client.latest((feedback as any).options.entity_id)
						if (!event) return false
						return Boolean(event.state) === Boolean(feedback.options.state)
					},
				}
			})
		}
		return feedbacks
	},
}
