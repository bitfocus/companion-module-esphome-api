import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { EsphomeClient } from '../esphomeClient'

export interface EntityAdapter<T> {
	is(instance: any): instance is T
	createActions(client: EsphomeClient): CompanionActionDefinitions
	createFeedbacks(client: EsphomeClient): CompanionFeedbackDefinitions
}
