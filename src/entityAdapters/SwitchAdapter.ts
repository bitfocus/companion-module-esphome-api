import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { SwitchEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { ActionId, FeedbackId, OnOffToggle } from '../util.js'
import { EntityPicker, OnOffPicker, OnOffTogglePicker } from '../choices.js'
import { entityVariableId } from '../variables.js'

export const SwitchAdapter: EntityAdapter<SwitchEntity> = {
	entityType: 'switch',

	is: (instance: unknown): instance is SwitchEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'switch'
	},

	getFeedbackIds: (): string[] => [FeedbackId.SwitchState],

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

	createPresets: (client: EsphomeWrapper): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('switch')) {
			const id = `preset_${entityVariableId(entity.id)}_toggle`
			presets[id] = makeSimplePreset(
				`${entity.name || entity.id} Toggle`,
				entity.name || entity.id,
				[
					{
						down: [{ actionId: ActionId.SwitchState, options: { entity_id: entity.id, state: OnOffToggle.Toggle } }],
						up: [],
					},
				],
				[
					{
						feedbackId: FeedbackId.SwitchState,
						options: { entity_id: entity.id, state: true },
						style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					},
				],
			)
			ids.push(id)
		}
		return { sections: makePresetSection('switches', 'Switches', ids), presets }
	},
}
