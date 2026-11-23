import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { SwitchEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { ActionId, FeedbackId, OnOffToggle } from '../util.js'
import { EntityPicker, OnOffPicker, OnOffTogglePicker } from '../choices.js'

export const SwitchAdapter: EntityAdapter<SwitchEntity> = {
	is: (instance: unknown): instance is SwitchEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'switch'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const switches = client.getEntities('switch')
		if (switches.length) {
			actions[ActionId.SwitchState] = {
				name: 'Set switch state',
				options: [EntityPicker(switches), OnOffTogglePicker()],
				callback: (evt): void => {
					const entityId = evt.options.entity_id as string
					const nextState =
						evt.options.state === OnOffToggle.Toggle
							? !client.latest(entityId)?.state
							: evt.options.state === OnOffToggle.On
					client.command(entityId, { state: nextState })
				},
			}
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const switches = client.getEntities('switch')
		if (switches.length) {
			feedbacks[FeedbackId.SwitchState] = {
				type: 'boolean',
				name: 'Change from switch state',
				description: 'True when the switch state matches the rule',
				options: [EntityPicker(switches), OnOffPicker()],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					return Boolean(event.state) === Boolean(feedback.options.state)
				},
			}
		}
		return feedbacks
	},
}
