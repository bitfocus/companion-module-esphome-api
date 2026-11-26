import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { ColorMode, LightEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makeLayeredFeedback, makeLayeredIconPreset, makePresetSection } from './base.js'
import { ActionId, FeedbackId, OnOffToggle, PrefixedActionIds, PrefixedFeedbackIds, isBrightRgb } from '../util.js'
import {
	EntityPicker,
	NumberComparitor,
	NumberComparitorPicker,
	NumberValuePicker,
	OnOffPicker,
	OnOffTogglePicker,
	compareNumber,
} from '../choices.js'
import { entityVariableId } from '../variables.js'

const COLOR_MODE_BRIGHTNESS_BIT = 2
const COLOR_MODE_WHITE_BIT = 4
const COLOR_MODE_COLOR_TEMP_BIT = 8
const COLOR_MODE_COLD_WARM_WHITE_BIT = 16
const COLOR_MODE_RGB_BIT = 32

function hasColorModeBit(entity: unknown, bit: number): boolean {
	const modes = (entity as LightEntity | undefined)?.supportedColorModes
	if (!modes || modes.length === 0) return true
	return modes.some((m) => (m & bit) !== 0 && m !== ColorMode.UNKNOWN)
}

function supportsBrightness(entity: unknown): boolean {
	return hasColorModeBit(entity, COLOR_MODE_BRIGHTNESS_BIT)
}

function supportsWhite(entity: unknown): boolean {
	return hasColorModeBit(entity, COLOR_MODE_WHITE_BIT)
}

function supportsColorTemp(entity: unknown): boolean {
	return hasColorModeBit(entity, COLOR_MODE_COLOR_TEMP_BIT | COLOR_MODE_COLD_WARM_WHITE_BIT)
}

function supportsColdWarmWhite(entity: unknown): boolean {
	return hasColorModeBit(entity, COLOR_MODE_COLD_WARM_WHITE_BIT)
}

function supportsRgb(entity: unknown): boolean {
	return hasColorModeBit(entity, COLOR_MODE_RGB_BIT)
}

const transitionOption = {
	type: 'number' as const,
	label: 'Transition (ms)',
	id: 'transition',
	default: 0,
	min: 0,
	max: 60000,
	step: 100,
}

function withTransition(cmd: Record<string, unknown>, transition: unknown): Record<string, unknown> {
	const ms = Number(transition ?? 0)
	if (ms > 0) {
		cmd.transitionLength = ms
	}
	return cmd
}

function parseColorToRgb(color: unknown): { r: number; g: number; b: number } | undefined {
	if (typeof color === 'number' && !Number.isNaN(color)) {
		return {
			r: ((color >> 16) & 0xff) / 255,
			g: ((color >> 8) & 0xff) / 255,
			b: (color & 0xff) / 255,
		}
	}
	if (typeof color === 'string') {
		const hex = color.trim().match(/^#?([0-9a-f]{6})$/i)
		if (hex) {
			const n = parseInt(hex[1], 16)
			return {
				r: ((n >> 16) & 0xff) / 255,
				g: ((n >> 8) & 0xff) / 255,
				b: (n & 0xff) / 255,
			}
		}
		const rgb = color.trim().match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i)
		if (rgb) {
			return {
				r: Math.min(255, Math.max(0, Number(rgb[1]))) / 255,
				g: Math.min(255, Math.max(0, Number(rgb[2]))) / 255,
				b: Math.min(255, Math.max(0, Number(rgb[3]))) / 255,
			}
		}
	}
	return undefined
}

function miredsToRgb(mireds: number): { r: number; g: number; b: number } {
	const temp = Math.min(40000, Math.max(1000, 1_000_000 / mireds)) / 100
	const clamp = (v: number): number => Math.round(Math.min(255, Math.max(0, v)))
	const r = temp <= 66 ? 255 : 329.698727446 * Math.pow(temp - 60, -0.1332047592)
	const g =
		temp <= 66 ? 99.4708025861 * Math.log(temp) - 161.1195681661 : 288.1221695283 * Math.pow(temp - 60, -0.0755148492)
	const b = temp >= 66 ? 255 : temp <= 19 ? 0 : 138.5177312231 * Math.log(temp - 10) - 305.0447927307
	return { r: clamp(r), g: clamp(g), b: clamp(b) }
}

function getEffectiveRgb255(event: any): { r: number; g: number; b: number } {
	const colorMode = Number(event.colorMode ?? 0)
	const isRgbActive = colorMode === 0 || (colorMode & COLOR_MODE_RGB_BIT) !== 0
	if (!isRgbActive && Number(event.colorTemperature) > 0) {
		return miredsToRgb(Number(event.colorTemperature))
	}
	return {
		r: Math.round(Math.min(1, Math.max(0, Number(event.red ?? 0))) * 255),
		g: Math.round(Math.min(1, Math.max(0, Number(event.green ?? 0))) * 255),
		b: Math.round(Math.min(1, Math.max(0, Number(event.blue ?? 0))) * 255),
	}
}

export const LightAdapter: EntityAdapter<LightEntity> = {
	entityType: 'light',

	is: (instance: unknown): instance is LightEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'light'
	},

	getFeedbackIds: (entityId: string): string[] => [
		FeedbackId.LightState,
		FeedbackId.LightBrightness,
		FeedbackId.LightBrightnessCompare,
		FeedbackId.LightColor,
		FeedbackId.LightColorSync,
		FeedbackId.LightContrastColor,
		FeedbackId.LightColorTemp,
		FeedbackId.LightColorTempCompare,
		FeedbackId.LightWhite,
		FeedbackId.LightColdWhite,
		FeedbackId.LightWarmWhite,
		`${PrefixedFeedbackIds.LightEffect}${entityId}`,
	],

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const lights = client.getEntities('light')
		const brightnessLights = lights.filter(supportsBrightness)
		const rgbLights = lights.filter(supportsRgb)
		const colorTempLights = lights.filter(supportsColorTemp)
		const whiteLights = lights.filter(supportsWhite)
		const coldWarmWhiteLights = lights.filter(supportsColdWarmWhite)

		if (lights.length) {
			// State action - On/Off/Toggle
			actions[ActionId.LightState] = {
				name: 'Set light state',
				options: [EntityPicker(lights), OnOffTogglePicker(), transitionOption],
				callback: (evt): void => {
					const entityId = evt.options.entity_id as string
					const nextState =
						evt.options.state === OnOffToggle.Toggle
							? !client.latest(entityId)?.state
							: evt.options.state === OnOffToggle.On
					client.command(entityId, withTransition({ state: nextState }, evt.options.transition))
				},
			}
		}

		if (brightnessLights.length) {
			// Brightness action (0-100% mapped to 0-1 float)
			actions[ActionId.LightBrightness] = {
				name: 'Set light brightness (percentage)',
				options: [
					EntityPicker(brightnessLights),
					{ type: 'number', label: 'Brightness (%)', id: 'brightness', default: 50, min: 0, max: 100, step: 1 },
					transitionOption,
				],
				callback: (evt): void => {
					client.command(
						evt.options.entity_id as string,
						withTransition(
							{
								state: true,
								brightness: Number(evt.options.brightness) / 100,
							},
							evt.options.transition,
						),
					)
				},
			}
		}

		if (rgbLights.length) {
			// Color picker action
			actions[ActionId.LightColor] = {
				name: 'Set light color',
				options: [
					EntityPicker(rgbLights),
					{ type: 'colorpicker', label: 'Color', id: 'color', default: combineRgb(255, 255, 255) },
					transitionOption,
				],
				callback: (evt): void => {
					const rgb = parseColorToRgb(evt.options.color)
					if (!rgb) return
					client.command(
						evt.options.entity_id as string,
						withTransition(
							{
								state: true,
								rgb,
							},
							evt.options.transition,
						),
					)
				},
			}

			// Color RGB action (0-255 mapped to 0-1 floats)
			actions[ActionId.LightColorRGB] = {
				name: 'Set light color (RGB)',
				options: [
					EntityPicker(rgbLights),
					{ type: 'number', label: 'Red', id: 'red', default: 128, min: 0, max: 255, step: 1 },
					{ type: 'number', label: 'Green', id: 'green', default: 128, min: 0, max: 255, step: 1 },
					{ type: 'number', label: 'Blue', id: 'blue', default: 128, min: 0, max: 255, step: 1 },
					transitionOption,
				],
				callback: (evt): void => {
					client.command(
						evt.options.entity_id as string,
						withTransition(
							{
								state: true,
								rgb: {
									r: Number(evt.options.red) / 255,
									g: Number(evt.options.green) / 255,
									b: Number(evt.options.blue) / 255,
								},
							},
							evt.options.transition,
						),
					)
				},
			}
		}

		if (colorTempLights.length) {
			const minMireds = Math.min(...colorTempLights.map((l) => (l as unknown as LightEntity).minMireds ?? 153))
			const maxMireds = Math.max(...colorTempLights.map((l) => (l as unknown as LightEntity).maxMireds ?? 500))
			const defaultMireds = Math.min(maxMireds, Math.max(minMireds, 370))

			// Color Temperature action
			actions[ActionId.LightColorTemp] = {
				name: 'Set light color temperature (mireds)',
				options: [
					EntityPicker(colorTempLights),
					{
						type: 'number',
						label: 'Color Temperature',
						id: 'colorTemp',
						default: defaultMireds,
						min: minMireds,
						max: maxMireds,
						step: 1,
					},
					transitionOption,
				],
				callback: (evt): void => {
					client.command(
						evt.options.entity_id as string,
						withTransition(
							{
								state: true,
								colorTemperature: Number(evt.options.colorTemp),
							},
							evt.options.transition,
						),
					)
				},
			}
		}

		if (whiteLights.length) {
			actions[ActionId.LightWhite] = {
				name: 'Set light white level (percentage)',
				options: [
					EntityPicker(whiteLights),
					{ type: 'number', label: 'White (%)', id: 'white', default: 100, min: 0, max: 100, step: 1 },
					transitionOption,
				],
				callback: (evt): void => {
					client.command(
						evt.options.entity_id as string,
						withTransition(
							{
								state: true,
								white: Number(evt.options.white) / 100,
							},
							evt.options.transition,
						),
					)
				},
			}
		}

		if (coldWarmWhiteLights.length) {
			actions[ActionId.LightColdWarmWhite] = {
				name: 'Set light cold/warm white (percentage)',
				options: [
					EntityPicker(coldWarmWhiteLights),
					{ type: 'number', label: 'Cold White (%)', id: 'coldWhite', default: 50, min: 0, max: 100, step: 1 },
					{ type: 'number', label: 'Warm White (%)', id: 'warmWhite', default: 50, min: 0, max: 100, step: 1 },
					transitionOption,
				],
				callback: (evt): void => {
					client.command(
						evt.options.entity_id as string,
						withTransition(
							{
								state: true,
								coldWhite: Number(evt.options.coldWhite) / 100,
								warmWhite: Number(evt.options.warmWhite) / 100,
							},
							evt.options.transition,
						),
					)
				},
			}
		}

		for (const entity of lights) {
			const effects = (entity as unknown as LightEntity).effects
			if (effects && effects.length > 0) {
				actions[PrefixedActionIds.LightEffect + entity.id] = {
					name: `${entity.name || entity.id}: Set light effect`,
					options: [
						{
							type: 'dropdown',
							label: 'Effect',
							id: 'effect',
							default: effects[0],
							choices: effects.map((effect) => ({ id: effect, label: effect })),
						},
					],
					callback: (evt): void => {
						client.command(entity.id, { state: true, effect: evt.options.effect })
					},
				}
			}
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const lights = client.getEntities('light')
		const brightnessLights = lights.filter(supportsBrightness)
		const rgbLights = lights.filter(supportsRgb)
		const colorTempLights = lights.filter(supportsColorTemp)
		const whiteLights = lights.filter(supportsWhite)
		const coldWarmWhiteLights = lights.filter(supportsColdWarmWhite)

		if (lights.length) {
			feedbacks[FeedbackId.LightState] = {
				type: 'boolean',
				name: 'Change from light state',
				description: 'True when the light state matches the rule',
				options: [EntityPicker(lights), OnOffPicker()],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false

					return Boolean(event.state) === Boolean(feedback.options.state)
				},
			}
		}

		if (brightnessLights.length) {
			feedbacks[FeedbackId.LightBrightness] = {
				type: 'value',
				name: 'Light brightness value (%)',
				description: 'Outputs the current brightness percentage (0-100) of the light',
				options: [EntityPicker(brightnessLights)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || !event.state) return 0
					return Math.round(Math.min(1, Math.max(0, Number(event.brightness ?? 1))) * 100)
				},
			}

			feedbacks[FeedbackId.LightBrightnessCompare] = {
				type: 'boolean',
				name: 'Change from light brightness (%)',
				description: 'True when the light brightness percentage (0-100) matches the rule (0 when off)',
				options: [EntityPicker(brightnessLights), NumberComparitorPicker(), NumberValuePicker()],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					const pct = event.state ? Math.round(Math.min(1, Math.max(0, Number(event.brightness ?? 1))) * 100) : 0
					return compareNumber(feedback.options.value, feedback.options.comparitor, pct)
				},
			}
		}

		if (colorTempLights.length) {
			const colorTempUnitOption = {
				type: 'dropdown' as const,
				label: 'Unit',
				id: 'unit',
				default: 'mireds',
				choices: [
					{ id: 'mireds', label: 'Mireds' },
					{ id: 'kelvin', label: 'Kelvin (K)' },
				],
			}

			const readColorTemp = (entityId: string, unit: unknown): number | undefined => {
				const event = client.latest(entityId)
				if (!event || !event.state || event.colorTemperature === undefined) return undefined
				const mireds = Number(event.colorTemperature)
				if (!Number.isFinite(mireds) || mireds <= 0) return undefined
				return unit === 'kelvin' ? Math.round(1_000_000 / mireds) : Math.round(mireds)
			}

			feedbacks[FeedbackId.LightColorTemp] = {
				type: 'value',
				name: 'Light color temperature',
				description: 'Outputs the current color temperature in mireds or Kelvin (0 when off)',
				options: [EntityPicker(colorTempLights), colorTempUnitOption],
				callback: (feedback): number => {
					return readColorTemp(feedback.options.entity_id as string, feedback.options.unit) ?? 0
				},
			}

			feedbacks[FeedbackId.LightColorTempCompare] = {
				type: 'boolean',
				name: 'Change from light color temperature',
				description: 'True when the light is on and its color temperature matches the rule',
				options: [EntityPicker(colorTempLights), colorTempUnitOption, NumberComparitorPicker(), NumberValuePicker()],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const val = readColorTemp(feedback.options.entity_id as string, feedback.options.unit)
					if (val === undefined) return false
					return compareNumber(feedback.options.value, feedback.options.comparitor, val)
				},
			}
		}

		const toPercent = (v: unknown): number => Math.round(Math.min(1, Math.max(0, Number(v ?? 0))) * 100)

		if (whiteLights.length) {
			feedbacks[FeedbackId.LightWhite] = {
				type: 'value',
				name: 'Light white level (%)',
				description: 'Outputs the current white channel percentage (0-100, 0 when off)',
				options: [EntityPicker(whiteLights)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || !event.state || event.white === undefined) return 0
					return toPercent(event.white)
				},
			}
		}

		if (coldWarmWhiteLights.length) {
			feedbacks[FeedbackId.LightColdWhite] = {
				type: 'value',
				name: 'Light cold white level (%)',
				description: 'Outputs the current cold white channel percentage (0-100, 0 when off)',
				options: [EntityPicker(coldWarmWhiteLights)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || !event.state || event.coldWhite === undefined) return 0
					return toPercent(event.coldWhite)
				},
			}

			feedbacks[FeedbackId.LightWarmWhite] = {
				type: 'value',
				name: 'Light warm white level (%)',
				description: 'Outputs the current warm white channel percentage (0-100, 0 when off)',
				options: [EntityPicker(coldWarmWhiteLights)],
				callback: (feedback): number => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || !event.state || event.warmWhite === undefined) return 0
					return toPercent(event.warmWhite)
				},
			}
		}

		for (const entity of lights) {
			const effects = (entity as unknown as LightEntity).effects
			if (effects && effects.length > 0) {
				feedbacks[PrefixedFeedbackIds.LightEffect + entity.id] = {
					type: 'boolean',
					name: `${entity.name || entity.id}: Change from light effect`,
					description: 'True when the light effect matches the selected effect',
					options: [
						{
							type: 'dropdown',
							label: 'Effect',
							id: 'effect',
							default: effects[0],
							choices: effects.map((effect) => ({ id: effect, label: effect })),
						},
					],
					defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					callback: (feedback): boolean => {
						const event = client.latest(entity.id)
						if (!event || !event.state) return false
						return event.effect === feedback.options.effect
					},
				}
			}
		}

		if (rgbLights.length) {
			feedbacks[FeedbackId.LightColor] = {
				type: 'boolean',
				name: 'Change from light color',
				description: 'True when the light is on and its RGB color matches the selected color',
				options: [
					EntityPicker(rgbLights),
					{ type: 'colorpicker', label: 'Color', id: 'color', default: combineRgb(255, 255, 255) },
				],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || !event.state) return false
					const target = parseColorToRgb(feedback.options.color)
					if (!target) return false

					const r = Number(event.red ?? 0)
					const g = Number(event.green ?? 0)
					const b = Number(event.blue ?? 0)
					const tolerance = 0.02
					return (
						Math.abs(r - target.r) <= tolerance &&
						Math.abs(g - target.g) <= tolerance &&
						Math.abs(b - target.b) <= tolerance
					)
				},
			}

			feedbacks[FeedbackId.LightColorSync] = {
				type: 'value',
				name: 'Light color value',
				description: 'Outputs the current RGB hex color of the light (#000000 when off)',
				options: [EntityPicker(rgbLights)],
				callback: (feedback): string => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || !event.state) return '#000000'

					const { r, g, b } = getEffectiveRgb255(event)
					const toHex = (v: number): string => v.toString(16).padStart(2, '0')
					return `#${toHex(r)}${toHex(g)}${toHex(b)}`
				},
			}

			feedbacks[FeedbackId.LightContrastColor] = {
				type: 'value',
				name: 'Light contrast text color',
				description: 'Outputs #000000 or #ffffff for readable text over the current light color',
				options: [EntityPicker(rgbLights)],
				callback: (feedback): string => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || !event.state) return '#ffffff'

					const { r, g, b } = getEffectiveRgb255(event)
					return isBrightRgb(r, g, b) ? '#000000' : '#ffffff'
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const lightIds: string[] = []

		for (const entity of client.getEntities('light')) {
			const lightEntity = entity as unknown as LightEntity & { id: string }
			const label = lightEntity.name || lightEntity.id
			const varId = entityVariableId(lightEntity.id)

			// ================================================================
			// Toggle Preset
			// ================================================================
			const toggleId = `preset_${varId}_toggle`
			presets[toggleId] = makeLayeredIconPreset({
				name: `${label} Toggle`,
				text: label,
				icon: 'lightbulb-outline',
				steps: [
					{
						down: [
							{
								actionId: ActionId.LightState,
								options: { entity_id: lightEntity.id, state: OnOffToggle.Toggle, transition: 0 },
							},
						],
						up: [],
					},
				],
				feedbacks: [
					makeLayeredFeedback({
						feedbackId: FeedbackId.LightState,
						options: { entity_id: lightEntity.id, state: true },
						bgcolor: combineRgb(0, 255, 0),
						icon: 'lightbulb-on',
					}),
				],
			})
			lightIds.push(toggleId)

			// ================================================================
			// Brightness Display Preset
			// ================================================================
			if (supportsBrightness(lightEntity)) {
				const brightnessId = `preset_${varId}_brightness`
				presets[brightnessId] = makeLayeredIconPreset({
					name: `${label} Brightness`,
					text: `${label}\n$(local:light_brightness)%`,
					icon: 'brightness-6',
					gauge: {
						value: { isExpression: true, value: '$(local:light_brightness)' },
						min: 0,
						max: 100,
					},
					steps: [
						{
							down: [
								{
									actionId: ActionId.LightState,
									options: { entity_id: lightEntity.id, state: OnOffToggle.Toggle, transition: 0 },
								},
							],
							up: [],
						},
					],
					localVariables: [
						{
							variableType: 'feedback',
							variableName: 'light_brightness',
							feedbackId: FeedbackId.LightBrightness,
							options: { entity_id: lightEntity.id },
						},
					],
				})
				lightIds.push(brightnessId)
			}

			// ================================================================
			// RGB Color Sync Preset
			// ================================================================
			if (supportsRgb(lightEntity)) {
				const colorId = `preset_${varId}_color`
				presets[colorId] = makeLayeredIconPreset({
					name: `${label} Color`,
					text: `${label}\nColor`,
					icon: 'palette',
					iconContrastVar: 'light_text_color',
					bgcolor: { isExpression: true, value: '$(local:light_color)' },
					textColor: { isExpression: true, value: '$(local:light_text_color)' },
					steps: [
						{
							down: [
								{
									actionId: ActionId.LightState,
									options: { entity_id: lightEntity.id, state: OnOffToggle.Toggle, transition: 0 },
								},
							],
							up: [],
						},
					],
					localVariables: [
						{
							variableType: 'feedback',
							variableName: 'light_color',
							feedbackId: FeedbackId.LightColorSync,
							options: { entity_id: lightEntity.id },
						},
						{
							variableType: 'feedback',
							variableName: 'light_text_color',
							feedbackId: FeedbackId.LightContrastColor,
							options: { entity_id: lightEntity.id },
						},
					],
				})
				lightIds.push(colorId)
			}

			// ================================================================
			// Color Temperature Presets
			// ================================================================
			if (supportsColorTemp(lightEntity)) {
				const minMireds = lightEntity.minMireds ?? 153
				const maxMireds = lightEntity.maxMireds ?? 500
				const clampMireds = (m: number): number => Math.round(Math.min(maxMireds, Math.max(minMireds, m)))
				const tempRgb = (mireds: number): number => {
					const { r, g, b } = miredsToRgb(mireds)
					return combineRgb(r, g, b)
				}
				const tempPresets = [
					{ key: 'warm', label: 'Warm', mireds: clampMireds(370) },
					{ key: 'neutral', label: 'Neutral', mireds: clampMireds(250) },
					{ key: 'cool', label: 'Cool', mireds: clampMireds(167) },
				]
				for (const tp of tempPresets) {
					const tempId = `preset_${varId}_temp_${tp.key}`
					presets[tempId] = makeLayeredIconPreset({
						name: `${label} ${tp.label}`,
						text: `${label}\n${tp.label}`,
						icon: 'brightness-6',
						steps: [
							{
								down: [
									{
										actionId: ActionId.LightColorTemp,
										options: { entity_id: lightEntity.id, colorTemp: tp.mireds, transition: 0 },
									},
								],
								up: [],
							},
						],
						feedbacks: [
							makeLayeredFeedback({
								feedbackId: FeedbackId.LightColorTempCompare,
								options: {
									entity_id: lightEntity.id,
									unit: 'mireds',
									comparitor: NumberComparitor.Equal,
									value: tp.mireds,
								},
								bgcolor: tempRgb(tp.mireds),
								icon: 'brightness-6',
							}),
						],
					})
					lightIds.push(tempId)
				}
			}

			// ================================================================
			// Effect Presets
			// ================================================================
			const effects = lightEntity.effects
			if (effects && effects.length > 0) {
				for (const effect of effects) {
					const safeEffect = effect.replace(/[^a-zA-Z0-9_]/g, '_')
					const effectId = `preset_${varId}_effect_${safeEffect}`
					presets[effectId] = makeLayeredIconPreset({
						name: `${label}: ${effect}`,
						text: `${label}\n${effect}`,
						icon: 'palette',
						steps: [
							{
								down: [{ actionId: PrefixedActionIds.LightEffect + lightEntity.id, options: { effect } }],
								up: [],
							},
						],
						feedbacks: [
							makeLayeredFeedback({
								feedbackId: PrefixedFeedbackIds.LightEffect + lightEntity.id,
								options: { effect },
								bgcolor: combineRgb(0, 255, 0),
								icon: 'palette',
							}),
						],
					})
					lightIds.push(effectId)
				}
			}
		}

		return {
			sections: makePresetSection('lights', 'Lights', lightIds),
			presets,
		}
	},
}
