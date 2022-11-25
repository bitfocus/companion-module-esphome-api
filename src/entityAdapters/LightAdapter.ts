import { InstanceBase, CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { ActionId, FeedbackId, OnOffToggle } from '../util'
import Light from '../entities/LightEntity'
import { EntityPicker, OnOffPicker, OnOffTogglePicker } from '../choices'

export const LightAdapter: EntityAdapter<Light> = {
	is: (instance: any): instance is Light => {
		return instance instanceof Light
	},

	createActions: (client: EsphomeClient): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const lightEntities = client.getAll(LightAdapter)
		if (lightEntities.length) {
			actions[ActionId.LightState] = {
				name: 'Set light state',
				options: [EntityPicker(lightEntities), OnOffTogglePicker()],
				callback: (evt): void => {
					const id = evt.options.entity_id as string
					const e = client.getEntity(id, LightAdapter)
					if (!e) return
					let newState: boolean
					switch (evt.options.state as OnOffToggle) {
						case OnOffToggle.Off:
							newState = false
							break
						case OnOffToggle.Toggle:
							newState = !e.isOn
							break
						default:
							newState = true
							break
					}
					e.setState(newState)
				},
			}
			actions[ActionId.LightBrightness] = {
				name: 'Set light brightness (percentage)',
				options: [
					EntityPicker(lightEntities.filter((light) => light.supportsBrightness)),
					{
						type: 'number',
						label: 'Brightness',
						id: 'brightness',
						default: 50,
						min: 0,
						max: 100,
						step: 1,
						range: true,
					},
				],
				callback: (evt): void => {
					const id = evt.options.entity_id as string
					const e = client.getEntity(id, LightAdapter)
					e?.setBrightness(Number(evt.options.brightness) / 100)
				},
			}
		}
		return actions
	},

	createFeedbacks: (instance: InstanceBase<any>, client: EsphomeClient): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const entities = client.getAll(LightAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.LightState] = {
				type: 'boolean',
				name: 'Change from light state',
				description: 'If the light state matches the rule, change style of the bank',
				options: [EntityPicker(entities), OnOffPicker()],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const entity = client.getEntity(String(feedback.options.entity_id), LightAdapter)
					if (entity) {
						return entity.isOn === !!feedback.options.state
					}
					return false
				},
			}
		}
		return feedbacks
	},
}
