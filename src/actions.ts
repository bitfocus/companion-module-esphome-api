import { CompanionActionDefinitions } from '@companion-module/base'
import { EntityAdapters } from './entityAdapters'
import { EsphomeClient } from './esphomeClient'

export function GetActionsList(client: EsphomeClient): CompanionActionDefinitions {
	const actions: CompanionActionDefinitions = {}

	Object.values(EntityAdapters).forEach((adapter) => {
		Object.assign(actions, adapter.createActions(client))
	})

	return actions
}
