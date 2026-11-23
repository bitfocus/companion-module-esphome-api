import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { FanEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { ActionId, FeedbackId, OnOffToggle } from '../util.js'
import { EntityPicker, OnOffTogglePicker, OnOffPicker } from '../choices.js'
import { entityVariableId } from '../variables.js'

export const FanAdapter: EntityAdapter<FanEntity> = {
	is: (instance: unknown): instance is FanEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'fan'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const fans = client.getEntities('fan')
		if (fans.length) {
			actions[ActionId.FanState] = {
				name: 'Set fan state',
				options: [EntityPicker(fans), OnOffTogglePicker()],
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
		const fans = client.getEntities('fan')
		if (fans.length) {
			feedbacks[FeedbackId.FanState] = {
				type: 'boolean',
				name: 'Change from fan state',
				description: 'True when the fan state matches the rule',
				options: [EntityPicker(fans), OnOffPicker()],
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
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('fan')) {
			const id = `preset_${entityVariableId(entity.id)}_toggle`
			presets[id] = makeSimplePreset(
				`${entity.name || entity.id} Toggle`,
				entity.name || entity.id,
				[
					{
						down: [{ actionId: ActionId.FanState, options: { entity_id: entity.id, state: OnOffToggle.Toggle } }],
						up: [],
					},
				],
				[
					{
						feedbackId: FeedbackId.FanState,
						options: { entity_id: entity.id, state: true },
						style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					},
				],
			)
			ids.push(id)
		}
		return { sections: makePresetSection('fans', 'Fans', ids), presets }
	},
}
