import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { LightEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { ActionId, FeedbackId, OnOffToggle } from '../util.js'
import { EntityPicker, OnOffPicker, OnOffTogglePicker } from '../choices.js'

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

		if (lights.length) {
			// State action - On/Off/Toggle
			actions[ActionId.LightState] = {
				name: 'Set light state',
				options: [EntityPicker(lights), OnOffTogglePicker()],
				callback: (evt): void => {
					const entityId = evt.options.entity_id as string
					const nextState =
						evt.options.state === OnOffToggle.Toggle
							? !client.latest(entityId)?.state
							: evt.options.state === OnOffToggle.On
					client.command(entityId, { state: nextState })
				},
			}

			// Brightness action (0-100% mapped to 0-1 float)
			actions[ActionId.LightBrightness] = {
				name: 'Set light brightness (percentage)',
				options: [
					EntityPicker(lights),
					{ type: 'number', label: 'Brightness (%)', id: 'brightness', default: 50, min: 0, max: 100, step: 1 },
				],
				callback: (evt): void => {
					client.command(evt.options.entity_id as string, {
						state: true,
						brightness: Number(evt.options.brightness) / 100,
					})
				},
			}

			// Color picker action
			actions[ActionId.LightColor] = {
				name: 'Set light color',
				options: [
					EntityPicker(lights),
					{ type: 'colorpicker', label: 'Color', id: 'color', default: combineRgb(255, 255, 255) },
				],
				callback: (evt): void => {
					const rgb = parseColorToRgb(evt.options.color)
					if (!rgb) return
					client.command(evt.options.entity_id as string, {
						state: true,
						rgb,
					})
				},
			}

			// Color RGB action (0-255 mapped to 0-1 floats)
			actions[ActionId.LightColorRGB] = {
				name: 'Set light color (RGB)',
				options: [
					EntityPicker(lights),
					{ type: 'number', label: 'Red', id: 'red', default: 128, min: 0, max: 255, step: 1 },
					{ type: 'number', label: 'Green', id: 'green', default: 128, min: 0, max: 255, step: 1 },
					{ type: 'number', label: 'Blue', id: 'blue', default: 128, min: 0, max: 255, step: 1 },
				],
				callback: (evt): void => {
					client.command(evt.options.entity_id as string, {
						state: true,
						rgb: {
							r: Number(evt.options.red) / 255,
							g: Number(evt.options.green) / 255,
							b: Number(evt.options.blue) / 255,
						},
					})
				},
			}

			// Color Temperature action
			actions[ActionId.LightColorTemp] = {
				name: 'Set light color temperature (mireds)',
				options: [
					EntityPicker(lights),
					{ type: 'number', label: 'Color Temperature', id: 'colorTemp', default: 370, min: 153, max: 500, step: 1 },
				],
				callback: (evt): void => {
					client.command(evt.options.entity_id as string, {
						state: true,
						colorTemperature: Number(evt.options.colorTemp),
					})
				},
			}
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const lights = client.getEntities('light')

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

			feedbacks[FeedbackId.LightColor] = {
				type: 'boolean',
				name: 'Change from light color',
				description: 'True when the light is on and its RGB color matches the selected color',
				options: [
					EntityPicker(lights),
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
				options: [EntityPicker(lights)],
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
				options: [EntityPicker(lights)],
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
}
