import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { BinarySensorEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { FeedbackId } from '../util.js'
import { EntityPicker, OnOffPicker } from '../choices.js'

export const BinarySensorAdapter: EntityAdapter<BinarySensorEntity> = {
	is: (instance: unknown): instance is BinarySensorEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'binary_sensor'
	},

	createActions: (_client: EsphomeWrapper): CompanionActionDefinitions => {
		return {}
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const binarySensors = client.getEntities('binary_sensor')
		if (binarySensors.length) {
			feedbacks[FeedbackId.BinarySensorState] = {
				type: 'boolean',
				name: 'Change from binary sensor state',
				description: 'If the binary sensor state matches the rule, change style of the bank',
				options: [EntityPicker(binarySensors), OnOffPicker()],
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
