import type {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext,
} from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from '../config.js'
import { FeedbackId } from '../util.js'

export function upgrade0003_backfillTextSensorMatchType(
	_context: CompanionUpgradeContext<ModuleConfig>,
	props: CompanionStaticUpgradeProps<ModuleConfig, ModuleSecrets>,
): CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> {
	const updatedFeedbacks = []
	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId === String(FeedbackId.TextSensorValue) && feedback.options.matchType === undefined) {
			feedback.options.matchType = { isExpression: false, value: 'eq' }
			updatedFeedbacks.push(feedback)
		}
	}
	return {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks,
	}
}
