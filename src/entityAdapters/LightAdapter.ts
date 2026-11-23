import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { LightEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { ActionId, FeedbackId } from '../util.js'

export const LightAdapter: EntityAdapter<LightEntity> = {
	is: (instance: unknown): instance is LightEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'light'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const lightEntities = client.getAvailableEntityIds()['light'] || []

		if (lightEntities.length) {
			lightEntities.forEach((entityId: string) => {
				// State action - On/Off/Toggle
				actions[ActionId.LightState] = {
					name: 'Set light state',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						{
							type: 'dropdown',
							label: 'State',
							id: 'state',
							default: 'on',
							choices: [
								{ id: 'on', label: 'On' },
								{ id: 'off', label: 'Off' },
								{ id: 'toggle', label: 'Toggle' },
							],
						},
					],
					callback: (evt): void => {
						const commandOptions: any = {}
						if ((evt as any).options.state === 'toggle') {
							commandOptions.toggle = true
						} else {
							commandOptions.state = (evt as any).options.state === 'on'
						}
						client.command((evt as any).options.entity_id, commandOptions)
					},
				}

				// Brightness action
				actions[ActionId.LightBrightness] = {
					name: 'Set light brightness (percentage)',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						{ type: 'number', label: 'Brightness', id: 'brightness', default: 50, min: 0, max: 255, step: 1 },
					],
					callback: (evt): void => {
						client.command((evt as any).options.entity_id, { brightness: Number((evt as any).options.brightness) })
					},
				}

				// Color RGB action
				actions[ActionId.LightColorRGB] = {
					name: 'Set light color (RGB)',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						{ type: 'number', label: 'Red', id: 'red', default: 128, min: 0, max: 255, step: 1 },
						{ type: 'number', label: 'Green', id: 'green', default: 128, min: 0, max: 255, step: 1 },
						{ type: 'number', label: 'Blue', id: 'blue', default: 128, min: 0, max: 255, step: 1 },
					],
					callback: (evt): void => {
						client.command((evt as any).options.entity_id, {
							state: true,
							rgb: {
								r: Number((evt as any).options.red),
								g: Number((evt as any).options.green),
								b: Number((evt as any).options.blue),
							},
						})
					},
				}

				// Color Temperature action
				actions[ActionId.LightColorTemp] = {
					name: 'Set light color temperature (mireds)',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						{ type: 'number', label: 'Color Temperature', id: 'colorTemp', default: 370, min: 153, max: 500, step: 1 },
					],
					callback: (evt): void => {
						client.command((evt as any).options.entity_id, { colorTemperature: Number((evt as any).options.colorTemp) })
					},
				}
			})
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const lightEntities = client.getAvailableEntityIds()['light'] || []

		if (lightEntities.length) {
			lightEntities.forEach((entityId: string) => {
				feedbacks[FeedbackId.LightState] = {
					type: 'boolean',
					name: 'Change from light state',
					description: 'If the light state matches the rule, change style of the bank',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						{ type: 'checkbox', label: 'State', id: 'state', default: true },
					],
					defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					callback: (feedback): boolean => {
						const event = client.latest(feedback.options.entity_id as string)
						if (!event) return false

						return Boolean(event.state) === Boolean(feedback.options.state)
					},
				}
			})
		}
		return feedbacks
	},
}
