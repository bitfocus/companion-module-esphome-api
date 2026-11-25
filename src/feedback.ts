import type ESPHomeInstance from './main.js'
import { CompanionFeedbackDefinitions } from '@companion-module/base'
import { EntityAdapters } from './entityAdapters/index.js'
import { EsphomeWrapper } from './esphomeWrapper.js'

export type FeedbacksSchema = Record<string, any>

export function getFeedbackIdsForEntity(entityId: string, entityType: string): string[] {
	const adapter = Object.values(EntityAdapters).find((a) => a.entityType === entityType)
	return adapter?.getFeedbackIds?.(entityId) ?? []
}

export function UpdateFeedbacks(_: ESPHomeInstance): void {}

export function GetFeedbacksList(self: EsphomeWrapper): CompanionFeedbackDefinitions {
	const feedbacks = {}

	Object.values(EntityAdapters).forEach((adapter) => {
		Object.assign(feedbacks, adapter.createFeedbacks(self))
	})

	return feedbacks
}
