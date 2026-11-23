import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { ColorMode, LightEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { ActionId, FeedbackId, OnOffToggle, PrefixedActionIds, PrefixedFeedbackIds } from '../util.js'
import { EntityPicker, OnOffPicker, OnOffTogglePicker } from '../choices.js'
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
	return hasColorModeBit(entity, COLOR_MODE_COLOR_TEMP_BIT)
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

export const LightAdapter: EntityAdapter<LightEntity> = {
	is: (instance: unknown): instance is LightEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'light'
	},

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

					const toHex = (v: unknown): string =>
						Math.round(Math.min(1, Math.max(0, Number(v ?? 0))) * 255)
							.toString(16)
							.padStart(2, '0')
					return `#${toHex(event.red)}${toHex(event.green)}${toHex(event.blue)}`
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

					const r = Math.min(1, Math.max(0, Number(event.red ?? 0))) * 255
					const g = Math.min(1, Math.max(0, Number(event.green ?? 0))) * 255
					const b = Math.min(1, Math.max(0, Number(event.blue ?? 0))) * 255
					const luminance = 0.299 * r + 0.587 * g + 0.114 * b
					return luminance > 150 ? '#000000' : '#ffffff'
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const lightIds: string[] = []

		for (const entity of client.getEntities('light')) {
			const toggleId = `preset_${entityVariableId(entity.id)}_toggle`
			presets[toggleId] = makeSimplePreset(
				`${entity.name || entity.id} Toggle`,
				entity.name || entity.id,
				[
					{
						down: [{ actionId: ActionId.LightState, options: { entity_id: entity.id, state: OnOffToggle.Toggle } }],
						up: [],
					},
				],
				[
					{
						feedbackId: FeedbackId.LightState,
						options: { entity_id: entity.id, state: true },
						style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					},
				],
			)
			lightIds.push(toggleId)

			if (supportsRgb(entity)) {
				const colorId = `preset_${entityVariableId(entity.id)}_color`
				presets[colorId] = {
					type: 'layered',
					name: `${entity.name || entity.id} Color`,
					elements: [
						{
							type: 'box',
							id: 'bg',
							name: 'Background',
							color: { isExpression: true, value: '$(local:light_color)' },
						},
						{
							type: 'text',
							id: 'label',
							name: 'Label',
							text: `${entity.name || entity.id}\nColor`,
							color: { isExpression: true, value: '$(local:light_text_color)' },
							halign: 'center',
							valign: 'center',
						},
					],
					feedbacks: [],
					steps: [
						{
							down: [{ actionId: ActionId.LightState, options: { entity_id: entity.id, state: OnOffToggle.Toggle } }],
							up: [],
						},
					],
					localVariables: [
						{
							variableType: 'feedback',
							variableName: 'light_color',
							feedbackId: FeedbackId.LightColorSync,
							options: { entity_id: entity.id },
						},
						{
							variableType: 'feedback',
							variableName: 'light_text_color',
							feedbackId: FeedbackId.LightContrastColor,
							options: { entity_id: entity.id },
						},
					],
				}
				lightIds.push(colorId)
			}
		}

		return {
			sections: makePresetSection('lights', 'Lights', lightIds),
			presets,
		}
	},
}
