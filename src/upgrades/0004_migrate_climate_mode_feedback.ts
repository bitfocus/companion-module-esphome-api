import type {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionUpgradeContext,
} from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from '../config.js'
import { FeedbackId, PrefixedFeedbackIds } from '../util.js'

function readEntityId(raw: unknown): string | undefined {
	if (typeof raw === 'string' && raw) return raw
	if (typeof raw === 'object' && raw !== null) {
		const expr = raw as { isExpression?: boolean; value?: unknown }
		if (!expr.isExpression && typeof expr.value === 'string' && expr.value) {
			return expr.value
		}
	}
	return undefined
}

export function upgrade0004_migrateClimateModeFeedback(
	_context: CompanionUpgradeContext<ModuleConfig>,
	props: CompanionStaticUpgradeProps<ModuleConfig, ModuleSecrets>,
): CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> {
	const updatedFeedbacks = []
	for (const feedback of props.feedbacks) {
		if (feedback.feedbackId === String(FeedbackId.ClimateMode)) {
			const entityId = readEntityId(feedback.options.entity_id)
			if (entityId) {
				feedback.feedbackId = PrefixedFeedbackIds.ClimateMode + entityId
				delete feedback.options.entity_id
				updatedFeedbacks.push(feedback)
			}
		}
	}
	return {
		updatedConfig: null,
		updatedActions: [],
		updatedFeedbacks,
	}
}
