import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { SensorEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { FeedbackId } from '../util.js'
import { EntityPicker, NumberComparitorPicker, NumberValuePicker, compareNumber } from '../choices.js'

export const SensorAdapter: EntityAdapter<SensorEntity> = {
	is: (instance: unknown): instance is SensorEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'sensor'
	},

	createActions: (_client: EsphomeWrapper): CompanionActionDefinitions => {
		return {}
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const sensors = client.getEntities('sensor')
		if (sensors.length) {
			feedbacks[FeedbackId.SensorState] = {
				type: 'boolean',
				name: 'Change from sensor state',
				description: 'True when the sensor state matches the rule',
				options: [EntityPicker(sensors), NumberComparitorPicker(), NumberValuePicker()],
				defaultStyle: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event || event.state === undefined) return false
					return compareNumber(feedback.options.value, feedback.options.comparitor, Number(event.state))
				},
			}
		}
		return feedbacks
	},
}
