import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { LightEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { ActionId, FeedbackId, OnOffToggle } from '../util.js'
import { EntityPicker, OnOffPicker, OnOffTogglePicker } from '../choices.js'

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
		}
		return feedbacks
	},
}
