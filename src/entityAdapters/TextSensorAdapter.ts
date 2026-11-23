import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { TextSensorEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { FeedbackId } from '../util.js'

export const TextSensorAdapter: EntityAdapter<TextSensorEntity> = {
	is: (instance: unknown): instance is TextSensorEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'text_sensor'
	},

	createActions: (_client: EsphomeWrapper): CompanionActionDefinitions => {
		return {}
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const textSensors = client.getAvailableEntityIds()['text_sensor'] || []
		if (textSensors.length) {
			feedbacks[FeedbackId.TextSensorValue] = {
				type: 'value',
				name: 'Change from text sensor value',
				description: 'True when the text sensor value matches the rule',
				options: [
					{
						type: 'dropdown',
						label: 'Entity',
						id: 'entity_id',
						default: textSensors[0],
						choices: textSensors.map((e) => ({ id: e, label: e })),
					},
				],
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					return event.state === feedback.options.value
				},
			}
		}
		return feedbacks
	},
}
