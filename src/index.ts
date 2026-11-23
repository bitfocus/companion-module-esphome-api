import type {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
} from '@companion-module/base'
import type { ModuleConfig } from './config.js'
import ESPHomeInstance from './main.js'
import { ActionId } from './util.js'

const LIGHT_ACTIONS_WITH_TRANSITION = new Set<string>([
	ActionId.LightState,
	ActionId.LightBrightness,
	ActionId.LightColor,
	ActionId.LightColorRGB,
	ActionId.LightColorTemp,
])

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig>[] = [
	(
		_context: CompanionUpgradeContext<ModuleConfig>,
		props: CompanionStaticUpgradeProps<ModuleConfig, undefined>,
	): CompanionStaticUpgradeResult<ModuleConfig, undefined> => {
		const updatedActions = []
		for (const action of props.actions) {
			if (LIGHT_ACTIONS_WITH_TRANSITION.has(action.actionId) && action.options.transition === undefined) {
				action.options.transition = { isExpression: false, value: 0 }
				updatedActions.push(action)
			}
		}
		return {
			updatedConfig: null,
			updatedActions,
			updatedFeedbacks: [],
		}
	},
]

export default ESPHomeInstance
