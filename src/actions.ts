import { CompanionActions } from '../../../instance_skel_types'
import { EntityAdapters } from './entityAdapters'
import { EsphomeClient } from './esphomeClient'

export function GetActionsList(client: EsphomeClient): CompanionActions {
	const actions: CompanionActions = {}

	Object.values(EntityAdapters).forEach((adapter) => {
		Object.assign(actions, adapter.createActions(client))
	})

	return actions
}
