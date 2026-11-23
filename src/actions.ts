import type ESPHomeInstance from './main.js'

import { CompanionActionDefinitions } from '@companion-module/base'
import { EntityAdapters } from './entityAdapters/index.js'
import { EsphomeWrapper } from './esphomeWrapper.js'

export type ActionsSchema = Record<string, any>

export function GetActionsList(wrapper: EsphomeWrapper): CompanionActionDefinitions {
	const actions: CompanionActionDefinitions = {}

	Object.values(EntityAdapters).forEach((adapter) => {
		Object.assign(actions, adapter.createActions(wrapper))
	})

	return actions
}

export function UpdateActions(_: ESPHomeInstance): void {}
