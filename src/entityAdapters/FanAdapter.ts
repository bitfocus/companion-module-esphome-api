import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { FanDirection, FanEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makeLayeredFeedback, makeLayeredIconPreset, makePresetSection } from './base.js'
import { ActionId, FeedbackId, OnOffToggle, PrefixedActionIds, PrefixedFeedbackIds } from '../util.js'
import {
	EntityPicker,
	NumberComparitor,
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
			// ================================================================
			// Speed Action
			// ================================================================
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

			// ================================================================
			// Preset Mode Action
			// ================================================================
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
			// ================================================================
			// Preset Mode Feedback
			// ================================================================
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
			const fanEntity = entity as unknown as FanEntity & { id: string }
			const label = fanEntity.name || fanEntity.id
			const varId = entityVariableId(fanEntity.id)

			// ================================================================
			// Toggle Preset
			// ================================================================
			const toggleId = `preset_${varId}_toggle`
			presets[toggleId] = makeLayeredIconPreset({
				name: `${label} Toggle`,
				text: label,
				icon: 'fan-off',
				steps: [
					{
						down: [{ actionId: ActionId.FanState, options: { entity_id: fanEntity.id, state: OnOffToggle.Toggle } }],
						up: [],
					},
				],
				feedbacks: [
					makeLayeredFeedback({
						feedbackId: FeedbackId.FanState,
						options: { entity_id: fanEntity.id, state: true },
						bgcolor: combineRgb(0, 255, 0),
						icon: 'fan',
					}),
				],
			})
			ids.push(toggleId)

			// ================================================================
			// Speed Display Preset
			// ================================================================
			if (fanEntity.supportsSpeed) {
				const maxSpeed = fanEntity.supportedSpeedCount ?? 100
				const speedFeedbacks = [
					makeLayeredFeedback({
						feedbackId: FeedbackId.FanState,
						options: { entity_id: fanEntity.id, state: true },
						bgcolor: combineRgb(0, 255, 0),
						icon: 'fan',
					}),
				]
				if (maxSpeed > 0 && maxSpeed <= 5) {
					for (let level = 1; level <= Math.min(3, maxSpeed); level++) {
						speedFeedbacks.push(
							makeLayeredFeedback({
								feedbackId: FeedbackId.FanSpeedCompare,
								options: { entity_id: fanEntity.id, comparitor: NumberComparitor.Equal, value: level },
								bgcolor: combineRgb(0, 255, 0),
								icon: `fan-speed-${level}`,
							}),
						)
					}
				}

				const speedSteps: Array<{ down: Array<{ actionId: string; options: Record<string, any> }>; up: never[] }> = []
				if (maxSpeed > 0 && maxSpeed <= 5) {
					for (let level = 1; level <= maxSpeed; level++) {
						speedSteps.push({
							down: [{ actionId: PrefixedActionIds.FanSpeed + fanEntity.id, options: { speedLevel: level } }],
							up: [],
						})
					}
					speedSteps.push({
						down: [{ actionId: ActionId.FanState, options: { entity_id: fanEntity.id, state: OnOffToggle.Off } }],
						up: [],
					})
				}

				const speedId = `preset_${varId}_speed`
				presets[speedId] = makeLayeredIconPreset({
					name: `${label} Speed`,
					text: `${label}\n$(local:fan_speed)`,
					icon: 'fan-off',
					gauge: {
						value: { isExpression: true, value: '$(local:fan_speed)' },
						min: 0,
						max: maxSpeed,
					},
					steps: speedSteps,
					feedbacks: speedFeedbacks,
					localVariables: [
						{
							variableType: 'feedback',
							variableName: 'fan_speed',
							feedbackId: FeedbackId.FanSpeed,
							options: { entity_id: fanEntity.id },
						},
					],
				})
				ids.push(speedId)

				if (maxSpeed > 0 && maxSpeed <= 5) {
					const threeSpeedLabels = ['Low', 'Medium', 'High']
					for (let level = 1; level <= maxSpeed; level++) {
						const speedLabel = maxSpeed === 3 ? threeSpeedLabels[level - 1] : `Speed ${level}`
						const speedIcon = level <= 3 ? `fan-speed-${level}` : 'fan'
						const levelId = `preset_${varId}_speed_${level}`
						presets[levelId] = makeLayeredIconPreset({
							name: `${label} ${speedLabel}`,
							text: `${label}\n${speedLabel}`,
							icon: speedIcon,
							steps: [
								{
									down: [{ actionId: PrefixedActionIds.FanSpeed + fanEntity.id, options: { speedLevel: level } }],
									up: [],
								},
							],
							feedbacks: [
								makeLayeredFeedback({
									feedbackId: FeedbackId.FanSpeedCompare,
									options: { entity_id: fanEntity.id, comparitor: NumberComparitor.Equal, value: level },
									bgcolor: combineRgb(0, 255, 0),
									icon: speedIcon,
								}),
							],
						})
						ids.push(levelId)
					}
				}
			}

			// ================================================================
			// Oscillation Preset
			// ================================================================
			if (fanEntity.supportsOscillation) {
				const oscId = `preset_${varId}_oscillate`
				presets[oscId] = makeLayeredIconPreset({
					name: `${label} Oscillate`,
					text: `${label}\nOscillate`,
					icon: 'arrow-oscillating-off',
					steps: [
						{
							down: [
								{ actionId: ActionId.FanOscillating, options: { entity_id: fanEntity.id, state: OnOffToggle.Toggle } },
							],
							up: [],
						},
					],
					feedbacks: [
						makeLayeredFeedback({
							feedbackId: FeedbackId.FanOscillating,
							options: { entity_id: fanEntity.id, state: true },
							bgcolor: combineRgb(0, 255, 0),
							icon: 'arrow-oscillating',
						}),
					],
				})
				ids.push(oscId)
			}

			// ================================================================
			// Direction Presets
			// ================================================================
			if (fanEntity.supportsDirection) {
				const fwdId = `preset_${varId}_dir_fwd`
				presets[fwdId] = makeLayeredIconPreset({
					name: `${label} Forward`,
					text: `${label}\nForward`,
					icon: 'sync',
					steps: [
						{
							down: [
								{
									actionId: ActionId.FanDirection,
									options: { entity_id: fanEntity.id, direction: FanDirection.FORWARD },
								},
							],
							up: [],
						},
					],
					feedbacks: [
						makeLayeredFeedback({
							feedbackId: FeedbackId.FanDirection,
							options: { entity_id: fanEntity.id, direction: FanDirection.FORWARD },
							bgcolor: combineRgb(0, 255, 0),
							icon: 'sync',
						}),
					],
				})

				const revId = `preset_${varId}_dir_rev`
				presets[revId] = makeLayeredIconPreset({
					name: `${label} Reverse`,
					text: `${label}\nReverse`,
					icon: 'sync',
					steps: [
						{
							down: [
								{
									actionId: ActionId.FanDirection,
									options: { entity_id: fanEntity.id, direction: FanDirection.REVERSE },
								},
							],
							up: [],
						},
					],
					feedbacks: [
						makeLayeredFeedback({
							feedbackId: FeedbackId.FanDirection,
							options: { entity_id: fanEntity.id, direction: FanDirection.REVERSE },
							bgcolor: combineRgb(0, 255, 0),
							icon: 'sync',
						}),
					],
				})
				ids.push(fwdId, revId)
			}

			// ================================================================
			// Preset Mode Presets
			// ================================================================
			const presetModes = (fanEntity as { supportedPresetModes?: string[] }).supportedPresetModes
			if (presetModes && presetModes.length > 0) {
				for (const mode of presetModes) {
					const safeMode = mode.replace(/[^a-zA-Z0-9_]/g, '_')
					const presetId = `preset_${varId}_preset_${safeMode}`
					presets[presetId] = makeLayeredIconPreset({
						name: `${label}: ${mode}`,
						text: `${label}\n${mode}`,
						icon: 'fan',
						steps: [
							{
								down: [{ actionId: PrefixedActionIds.FanPreset + fanEntity.id, options: { presetMode: mode } }],
								up: [],
							},
						],
						feedbacks: [
							makeLayeredFeedback({
								feedbackId: PrefixedFeedbackIds.FanPreset + fanEntity.id,
								options: { presetMode: mode },
								bgcolor: combineRgb(0, 255, 0),
								icon: 'fan',
							}),
						],
					})
					ids.push(presetId)
				}
			}
		}
		return { sections: makePresetSection('fans', 'Fans', ids), presets }
	},
}
