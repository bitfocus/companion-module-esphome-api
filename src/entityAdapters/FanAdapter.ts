import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { FanDirection, FanEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { ActionId, FeedbackId, OnOffToggle, PrefixedActionIds, PrefixedFeedbackIds } from '../util.js'
import {
	EntityPicker,
	NumberComparitorPicker,
	NumberValuePicker,
	OnOffTogglePicker,
	OnOffPicker,
	compareNumber,
} from '../choices.js'
import { entityVariableId } from '../variables.js'

export const FanAdapter: EntityAdapter<FanEntity> = {
	entityType: 'fan',

	is: (instance: unknown): instance is FanEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'fan'
	},

	getFeedbackIds: (entityId: string): string[] => [
		FeedbackId.FanState,
		FeedbackId.FanSpeed,
		FeedbackId.FanSpeedCompare,
		FeedbackId.FanOscillating,
		FeedbackId.FanDirection,
		`${PrefixedFeedbackIds.FanPreset}${entityId}`,
	],

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const fans = client.getEntities('fan')
		const oscillatingFans = fans.filter((f) => Boolean((f as unknown as FanEntity).supportsOscillation))
		const directionalFans = fans.filter((f) => Boolean((f as unknown as FanEntity).supportsDirection))

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

		for (const entity of fans) {
			const fanEntity = entity as unknown as FanEntity & { id: string }
			if (fanEntity.supportsSpeed) {
				const maxSpeed = fanEntity.supportedSpeedCount ?? 100
				actions[PrefixedActionIds.FanSpeed + fanEntity.id] = {
					name: `${fanEntity.name || fanEntity.id}: Set fan speed`,
					options: [
						{
							type: 'number',
							label: 'Speed Level',
							id: 'speedLevel',
							default: 1,
							min: 1,
							max: maxSpeed,
							step: 1,
							range: true,
						},
					],
					callback: (evt): void => {
						client.command(fanEntity.id, { state: true, speedLevel: Number(evt.options.speedLevel) })
					},
				}
			}

			const presetModes = (fanEntity as { supportedPresetModes?: string[] }).supportedPresetModes
			if (presetModes && presetModes.length > 0) {
				actions[PrefixedActionIds.FanPreset + fanEntity.id] = {
					name: `${fanEntity.name || fanEntity.id}: Set fan preset`,
					options: [
						{
							type: 'dropdown',
							label: 'Preset Mode',
							id: 'presetMode',
							default: presetModes[0],
							choices: presetModes.map((mode) => ({ id: mode, label: mode })),
						},
					],
					callback: (evt): void => {
						client.command(fanEntity.id, { state: true, presetMode: evt.options.presetMode })
					},
				}
			}
		}

		if (oscillatingFans.length) {
			actions[ActionId.FanOscillating] = {
				name: 'Set fan oscillation',
				options: [EntityPicker(oscillatingFans), OnOffTogglePicker()],
				callback: (evt): void => {
					const entityId = evt.options.entity_id as string
					const nextOscillating =
						evt.options.state === OnOffToggle.Toggle
							? !client.latest(entityId)?.oscillating
							: evt.options.state === OnOffToggle.On
					client.command(entityId, { oscillating: nextOscillating })
				},
			}
		}

		if (directionalFans.length) {
			actions[ActionId.FanDirection] = {
				name: 'Set fan direction',
				options: [
					EntityPicker(directionalFans),
					{
						type: 'dropdown',
						label: 'Direction',
						id: 'direction',
						default: FanDirection.FORWARD,
						choices: [
							{ id: FanDirection.FORWARD, label: 'Forward' },
							{ id: FanDirection.REVERSE, label: 'Reverse' },
						],
					},
				],
				callback: (evt): void => {
					client.command(evt.options.entity_id as string, { direction: Number(evt.options.direction) })
				},
			}
		}

		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const fans = client.getEntities('fan')
		const speedFans = fans.filter((f) => Boolean((f as unknown as FanEntity).supportsSpeed))
		const oscillatingFans = fans.filter((f) => Boolean((f as unknown as FanEntity).supportsOscillation))
		const directionalFans = fans.filter((f) => Boolean((f as unknown as FanEntity).supportsDirection))

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

		if (speedFans.length) {
			feedbacks[FeedbackId.FanSpeed] = {
				type: 'value',
				name: 'Fan speed level',
				description: 'Outputs the current fan speed level (0 when off)',
				options: [EntityPicker(speedFans)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || !event.state) return 0
					return Number(event.speedLevel ?? 0)
				},
			}

			feedbacks[FeedbackId.FanSpeedCompare] = {
				type: 'boolean',
				name: 'Change from fan speed level',
				description: 'True when the fan speed level matches the rule (0 when off)',
				options: [EntityPicker(speedFans), NumberComparitorPicker(), NumberValuePicker()],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					const speed = event.state ? Number(event.speedLevel ?? 0) : 0
					return compareNumber(feedback.options.value, feedback.options.comparitor, speed)
				},
			}
		}

		for (const entity of fans) {
			const fanEntity = entity as unknown as FanEntity & { id: string }
			const presetModes = (fanEntity as { supportedPresetModes?: string[] }).supportedPresetModes
			if (presetModes && presetModes.length > 0) {
				feedbacks[PrefixedFeedbackIds.FanPreset + fanEntity.id] = {
					type: 'boolean',
					name: `${fanEntity.name || fanEntity.id}: Change from fan preset`,
					description: 'True when the fan preset mode matches the selected preset',
					options: [
						{
							type: 'dropdown',
							label: 'Preset Mode',
							id: 'presetMode',
							default: presetModes[0],
							choices: presetModes.map((mode) => ({ id: mode, label: mode })),
						},
					],
					defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					callback: (feedback): boolean => {
						const event = client.latest(fanEntity.id)
						if (!event) return false
						return event.presetMode === feedback.options.presetMode
					},
				}
			}
		}

		if (oscillatingFans.length) {
			feedbacks[FeedbackId.FanOscillating] = {
				type: 'boolean',
				name: 'Change from fan oscillation',
				description: 'True when the fan oscillation state matches the rule',
				options: [EntityPicker(oscillatingFans), OnOffPicker()],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					return Boolean(event.oscillating) === Boolean(feedback.options.state)
				},
			}
		}

		if (directionalFans.length) {
			feedbacks[FeedbackId.FanDirection] = {
				type: 'boolean',
				name: 'Change from fan direction',
				description: 'True when the fan direction matches the selected direction',
				options: [
					EntityPicker(directionalFans),
					{
						type: 'dropdown',
						label: 'Direction',
						id: 'direction',
						default: FanDirection.FORWARD,
						choices: [
							{ id: FanDirection.FORWARD, label: 'Forward' },
							{ id: FanDirection.REVERSE, label: 'Reverse' },
						],
					},
				],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					return (event.direction ?? FanDirection.FORWARD) === feedback.options.direction
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
