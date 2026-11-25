import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { ClimateAction, ClimateEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { FeedbackId, PrefixedActionIds, PrefixedFeedbackIds } from '../util.js'
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

	getFeedbackIds: (entityId: string): string[] => [
		FeedbackId.ClimateMode,
		FeedbackId.ClimateAction,
		FeedbackId.ClimateCurrentTemp,
		FeedbackId.ClimateTargetTemp,
		FeedbackId.ClimateTargetTempLow,
		FeedbackId.ClimateTargetTempHigh,
		FeedbackId.ClimateTargetHumidity,
		FeedbackId.ClimateCurrentHumidity,
		`${PrefixedFeedbackIds.ClimateFanMode}${entityId}`,
		`${PrefixedFeedbackIds.ClimatePreset}${entityId}`,
		`${PrefixedFeedbackIds.ClimateSwingMode}${entityId}`,
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
		const twoPointClimates = climates.filter((c) =>
			Boolean((c as unknown as ClimateEntity).supportsTwoPointTargetTemperature),
		)
		const targetHumidityClimates = climates.filter((c) =>
			Boolean((c as unknown as ClimateEntity).supportsTargetHumidity),
		)
		const currentHumidityClimates = climates.filter((c) =>
			Boolean((c as unknown as ClimateEntity).supportsCurrentHumidity),
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

		if (twoPointClimates.length) {
			feedbacks[FeedbackId.ClimateTargetTempLow] = {
				type: 'value',
				name: 'Climate target low temperature',
				description: 'Outputs the target low temperature for two-point thermostats',
				options: [EntityPicker(twoPointClimates)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.targetTemperatureLow === undefined) return 0
					return Number(Number(event.targetTemperatureLow).toFixed(1))
				},
			}

			feedbacks[FeedbackId.ClimateTargetTempHigh] = {
				type: 'value',
				name: 'Climate target high temperature',
				description: 'Outputs the target high temperature for two-point thermostats',
				options: [EntityPicker(twoPointClimates)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.targetTemperatureHigh === undefined) return 0
					return Number(Number(event.targetTemperatureHigh).toFixed(1))
				},
			}
		}

		if (targetHumidityClimates.length) {
			feedbacks[FeedbackId.ClimateTargetHumidity] = {
				type: 'value',
				name: 'Climate target humidity (%)',
				description: 'Outputs the target humidity percentage',
				options: [EntityPicker(targetHumidityClimates)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.targetHumidity === undefined) return 0
					return Math.round(Number(event.targetHumidity))
				},
			}
		}

		if (currentHumidityClimates.length) {
			feedbacks[FeedbackId.ClimateCurrentHumidity] = {
				type: 'value',
				name: 'Climate current humidity (%)',
				description: 'Outputs the current measured humidity percentage',
				options: [EntityPicker(currentHumidityClimates)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.currentHumidity === undefined) return 0
					return Math.round(Number(event.currentHumidity))
				},
			}
		}

		for (const entity of climates) {
			const climateEntity = entity as unknown as ClimateEntity & { id: string }
			const labelPrefix = climateEntity.name || climateEntity.id

			const fanModes = climateEntity.supportedFanModes ?? []
			const customFanModes = climateEntity.supportedCustomFanModes ?? []
			if (fanModes.length > 0 || customFanModes.length > 0) {
				const choices = [
					...fanModes.map((m) => ({ id: `std:${m}`, label: ClimateFanModeLabels[m] ?? String(m) })),
					...customFanModes.map((m) => ({ id: `custom:${m}`, label: m })),
				]
				feedbacks[PrefixedFeedbackIds.ClimateFanMode + climateEntity.id] = {
					type: 'boolean',
					name: `${labelPrefix}: Change from fan mode`,
					description: 'True when the climate fan mode matches the selected mode',
					options: [
						{
							type: 'dropdown',
							label: 'Fan Mode',
							id: 'fanMode',
							default: choices[0].id,
							choices,
						},
					],
					defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					callback: (feedback): boolean => {
						const event = client.latest(climateEntity.id)
						if (!event) return false
						const val = feedback.options.fanMode as string
						if (val.startsWith('custom:')) {
							return event.customFanMode === val.slice(7)
						}
						if (val.startsWith('std:')) {
							return event.fanMode === Number(val.slice(4))
						}
						return false
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
				feedbacks[PrefixedFeedbackIds.ClimatePreset + climateEntity.id] = {
					type: 'boolean',
					name: `${labelPrefix}: Change from preset`,
					description: 'True when the climate preset matches the selected preset',
					options: [
						{
							type: 'dropdown',
							label: 'Preset',
							id: 'preset',
							default: choices[0].id,
							choices,
						},
					],
					defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					callback: (feedback): boolean => {
						const event = client.latest(climateEntity.id)
						if (!event) return false
						const val = feedback.options.preset as string
						if (val.startsWith('custom:')) {
							return event.customPreset === val.slice(7)
						}
						if (val.startsWith('std:')) {
							return event.preset === Number(val.slice(4))
						}
						return false
					},
				}
			}

			const swingModes = climateEntity.supportedSwingModes ?? []
			if (swingModes.length > 0) {
				feedbacks[PrefixedFeedbackIds.ClimateSwingMode + climateEntity.id] = {
					type: 'boolean',
					name: `${labelPrefix}: Change from swing mode`,
					description: 'True when the climate swing mode matches the selected mode',
					options: [
						{
							type: 'dropdown',
							label: 'Swing Mode',
							id: 'swingMode',
							default: swingModes[0],
							choices: swingModes.map((s) => ({ id: s, label: ClimateSwingModeLabels[s] ?? String(s) })),
						},
					],
					defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					callback: (feedback): boolean => {
						const event = client.latest(climateEntity.id)
						if (!event) return false
						return event.swingMode === feedback.options.swingMode
					},
				}
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
