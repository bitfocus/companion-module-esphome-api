import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { EntityAdapters } from './entityAdapters'
import { EsphomeClient } from './esphomeClient'

export function GetFeedbacksList(client: EsphomeClient): CompanionFeedbackDefinitions {
	const feedbacks = {}

	Object.values(EntityAdapters).forEach((adapter) => {
		Object.assign(feedbacks, adapter.createFeedbacks(client))
	})

	return feedbacks
}
