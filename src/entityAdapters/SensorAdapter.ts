import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { SensorEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { FeedbackId } from '../util.js'
import { NumberComparitorPicker, NumberValuePicker } from '../choices.js'

export const SensorAdapter: EntityAdapter<SensorEntity> = {
	is: (instance: unknown): instance is SensorEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'sensor'
	},

	createActions: (_client: EsphomeWrapper): CompanionActionDefinitions => {
		return {}
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const sensors = client.getAvailableEntityIds()['sensor'] || []
		if (sensors.length) {
			feedbacks[FeedbackId.SensorState] = {
				type: 'value',
				name: 'Change from sensor state',
				description: 'If the sensor state matches the rule, change style of the bank',
				options: [
					{
						type: 'dropdown',
						label: 'Entity',
						id: 'entity_id',
						default: sensors[0],
						choices: sensors.map((e) => ({ id: e, label: e })),
					},
					NumberComparitorPicker(),
					NumberValuePicker(),
				],
				callback: (feedback): number | null => {
					const event = client.latest((feedback as any).options.entity_id)
					if (!event) return null
					return event.state === (feedback as any).options.value ? 1 : 0
				},
			}
		}
		return feedbacks
	},
}
