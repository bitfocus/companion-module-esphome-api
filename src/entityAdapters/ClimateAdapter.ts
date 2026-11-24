import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { ClimateAction, ClimateEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { FeedbackId, PrefixedActionIds } from '../util.js'
import {
	AllClimateModes,
	ClimateActionLabels,
	ClimateFanModeLabels,
	ClimateMode,
	ClimateModeLabels,
	ClimateModePicker,
	ClimatePresetLabels,
	ClimateSwingModeLabels,
	EntityPicker,
} from '../choices.js'
import { entityVariableId } from '../variables.js'

export const ClimateAdapter: EntityAdapter<ClimateEntity> = {
	entityType: 'climate',

	is: (instance: unknown): instance is ClimateEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'climate'
	},

	getFeedbackIds: (): string[] => [
		FeedbackId.ClimateMode,
		FeedbackId.ClimateAction,
		FeedbackId.ClimateCurrentTemp,
		FeedbackId.ClimateTargetTemp,
	],

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const climates = client.getEntities('climate')
		for (const entity of climates) {
			const climateEntity = entity as unknown as ClimateEntity & { id: string }
			const labelPrefix = climateEntity.name || climateEntity.id
			const supportedModes =
				climateEntity.supportedModes && climateEntity.supportedModes.length
					? [...climateEntity.supportedModes]
					: AllClimateModes

			actions[PrefixedActionIds.ClimateMode + climateEntity.id] = {
				name: `${labelPrefix}: Set climate mode`,
				options: [ClimateModePicker(supportedModes)],
				callback: (evt): void => {
					client.command(climateEntity.id, { mode: Number(evt.options.mode) })
				},
			}

			const minTemp = climateEntity.visualMinTemperature ?? 10
			const maxTemp = climateEntity.visualMaxTemperature ?? 30
			const stepTemp = Number((climateEntity.visualTargetTemperatureStep ?? 0.5).toFixed(2)) || 0.5
			const defaultTemp = Math.min(maxTemp, Math.max(minTemp, 21))

			if (!climateEntity.requiresTwoPointTargetTemperature) {
				actions[PrefixedActionIds.ClimateTargetTemp + climateEntity.id] = {
					name: `${labelPrefix}: Set target temperature`,
					options: [
						{
							type: 'number',
							label: 'Target Temperature',
							id: 'targetTemperature',
							default: defaultTemp,
							min: minTemp,
							max: maxTemp,
							step: stepTemp,
							range: true,
						},
					],
					callback: (evt): void => {
						client.command(climateEntity.id, { targetTemperature: Number(evt.options.targetTemperature) })
					},
				}
			}

			if (climateEntity.supportsTwoPointTargetTemperature) {
				actions[PrefixedActionIds.ClimateTargetTempRange + climateEntity.id] = {
					name: `${labelPrefix}: Set target temperature range`,
					options: [
						{
							type: 'number',
							label: 'Low Temperature',
							id: 'targetTemperatureLow',
							default: minTemp,
							min: minTemp,
							max: maxTemp,
							step: stepTemp,
							range: true,
						},
						{
							type: 'number',
							label: 'High Temperature',
							id: 'targetTemperatureHigh',
							default: maxTemp,
							min: minTemp,
							max: maxTemp,
							step: stepTemp,
							range: true,
						},
					],
					callback: (evt): void => {
						client.command(climateEntity.id, {
							targetTemperatureLow: Number(evt.options.targetTemperatureLow),
							targetTemperatureHigh: Number(evt.options.targetTemperatureHigh),
						})
					},
				}
			}

			const fanModes = climateEntity.supportedFanModes ?? []
			const customFanModes = climateEntity.supportedCustomFanModes ?? []
			if (fanModes.length > 0 || customFanModes.length > 0) {
				const choices = [
					...fanModes.map((m) => ({ id: `std:${m}`, label: ClimateFanModeLabels[m] ?? String(m) })),
					...customFanModes.map((m) => ({ id: `custom:${m}`, label: m })),
				]
				actions[PrefixedActionIds.ClimateFanMode + climateEntity.id] = {
					name: `${labelPrefix}: Set fan mode`,
					options: [
						{
							type: 'dropdown',
							label: 'Fan Mode',
							id: 'fanMode',
							default: choices[0].id,
							choices,
						},
					],
					callback: (evt): void => {
						const val = evt.options.fanMode as string
						if (val.startsWith('custom:')) {
							client.command(climateEntity.id, { customFanMode: val.slice(7) })
						} else if (val.startsWith('std:')) {
							client.command(climateEntity.id, { fanMode: Number(val.slice(4)) })
						}
					},
				}
			}

			const presets = climateEntity.supportedPresets ?? []
			const customPresets = climateEntity.supportedCustomPresets ?? []
			if (presets.length > 0 || customPresets.length > 0) {
				const choices = [
					...presets.map((p) => ({ id: `std:${p}`, label: ClimatePresetLabels[p] ?? String(p) })),
					...customPresets.map((p) => ({ id: `custom:${p}`, label: p })),
				]
				actions[PrefixedActionIds.ClimatePreset + climateEntity.id] = {
					name: `${labelPrefix}: Set preset`,
					options: [
						{
							type: 'dropdown',
							label: 'Preset',
							id: 'preset',
							default: choices[0].id,
							choices,
						},
					],
					callback: (evt): void => {
						const val = evt.options.preset as string
						if (val.startsWith('custom:')) {
							client.command(climateEntity.id, { customPreset: val.slice(7) })
						} else if (val.startsWith('std:')) {
							client.command(climateEntity.id, { preset: Number(val.slice(4)) })
						}
					},
				}
			}

			const swingModes = climateEntity.supportedSwingModes ?? []
			if (swingModes.length > 0) {
				actions[PrefixedActionIds.ClimateSwingMode + climateEntity.id] = {
					name: `${labelPrefix}: Set swing mode`,
					options: [
						{
							type: 'dropdown',
							label: 'Swing Mode',
							id: 'swingMode',
							default: swingModes[0],
							choices: swingModes.map((s) => ({ id: s, label: ClimateSwingModeLabels[s] ?? String(s) })),
						},
					],
					callback: (evt): void => {
						client.command(climateEntity.id, { swingMode: Number(evt.options.swingMode) })
					},
				}
			}

			if (climateEntity.supportsTargetHumidity) {
				const minHum = climateEntity.visualMinHumidity ?? 30
				const maxHum = climateEntity.visualMaxHumidity ?? 99
				actions[PrefixedActionIds.ClimateTargetHumidity + climateEntity.id] = {
					name: `${labelPrefix}: Set target humidity`,
					options: [
						{
							type: 'number',
							label: 'Target Humidity (%)',
							id: 'targetHumidity',
							default: Math.min(maxHum, Math.max(minHum, 50)),
							min: minHum,
							max: maxHum,
							step: 1,
							range: true,
						},
					],
					callback: (evt): void => {
						client.command(climateEntity.id, { targetHumidity: Number(evt.options.targetHumidity) })
					},
				}
			}
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const climates = client.getEntities('climate')
		const actionClimates = climates.filter((c) => Boolean((c as unknown as ClimateEntity).supportsAction))
		const currentTempClimates = climates.filter((c) =>
			Boolean((c as unknown as ClimateEntity).supportsCurrentTemperature),
		)

		if (climates.length) {
			feedbacks[FeedbackId.ClimateMode] = {
				type: 'boolean',
				name: 'Change from climate mode',
				description: 'True when the climate mode matches the rule',
				options: [EntityPicker(climates), ClimateModePicker(AllClimateModes)],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					const currentMode = event.mode ?? ClimateMode.OFF
					return currentMode === feedback.options.mode
				},
			}

			feedbacks[FeedbackId.ClimateTargetTemp] = {
				type: 'value',
				name: 'Climate target temperature',
				description: 'Outputs the current target temperature',
				options: [EntityPicker(climates)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.targetTemperature === undefined) return 0
					return Number(Number(event.targetTemperature).toFixed(1))
				},
			}
		}

		if (actionClimates.length) {
			feedbacks[FeedbackId.ClimateAction] = {
				type: 'boolean',
				name: 'Change from climate action',
				description: 'True when the climate current action matches the selected action',
				options: [
					EntityPicker(actionClimates),
					{
						type: 'dropdown',
						label: 'Action',
						id: 'action',
						default: ClimateAction.OFF,
						choices: Object.entries(ClimateActionLabels).map(([id, label]) => ({ id: Number(id), label })),
					},
				],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					return (event.action ?? ClimateAction.OFF) === feedback.options.action
				},
			}
		}

		if (currentTempClimates.length) {
			feedbacks[FeedbackId.ClimateCurrentTemp] = {
				type: 'value',
				name: 'Climate current temperature',
				description: 'Outputs the current measured temperature',
				options: [EntityPicker(currentTempClimates)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.currentTemperature === undefined) return 0
					return Number(Number(event.currentTemperature).toFixed(1))
				},
			}
		}

		return feedbacks
	},

	createPresets: (client: EsphomeWrapper): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('climate')) {
			const climateEntity = entity as unknown as ClimateEntity & { id: string }
			const modes =
				climateEntity.supportedModes && climateEntity.supportedModes.length
					? [...climateEntity.supportedModes]
					: [ClimateMode.OFF]
			for (const mode of modes) {
				const label = ClimateModeLabels[mode] ?? String(mode)
				const id = `preset_${entityVariableId(climateEntity.id)}_mode_${mode}`
				presets[id] = makeSimplePreset(
					`${climateEntity.name || climateEntity.id}: ${label}`,
					`${climateEntity.name || climateEntity.id}\n${label}`,
					[{ down: [{ actionId: PrefixedActionIds.ClimateMode + climateEntity.id, options: { mode } }], up: [] }],
					[
						{
							feedbackId: FeedbackId.ClimateMode,
							options: { entity_id: climateEntity.id, mode },
							style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
						},
					],
				)
				ids.push(id)
			}
		}
		return { sections: makePresetSection('climate', 'Climate', ids), presets }
	},
}
