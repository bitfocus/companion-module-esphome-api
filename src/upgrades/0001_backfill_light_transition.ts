import type {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext,
} from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from '../config.js'
import { ActionId } from '../util.js'

export function upgrade0001_backfillLightTransition(
	_context: CompanionUpgradeContext<ModuleConfig>,
	props: CompanionStaticUpgradeProps<ModuleConfig, ModuleSecrets>,
): CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> {
	const lightActionsWithTransition = new Set<string>([
		ActionId.LightState,
		ActionId.LightBrightness,
		ActionId.LightColor,
		ActionId.LightColorRGB,
		ActionId.LightColorTemp,
	])

	const updatedActions = []
	for (const action of props.actions) {
		if (lightActionsWithTransition.has(action.actionId) && action.options.transition === undefined) {
			action.options.transition = { isExpression: false, value: 0 }
			updatedActions.push(action)
		}
	}
	return {
		updatedConfig: null,
		updatedActions,
		updatedFeedbacks: [],
	}
}
