import type {
	CompanionStaticUpgradeProps,
	CompanionStaticUpgradeResult,
	CompanionStaticUpgradeScript,
	CompanionUpgradeContext,
} from '@companion-module/base'
import type { ModuleConfig, ModuleSecrets } from './config.js'
import { ActionId, FeedbackId, PrefixedActionIds, PrefixedFeedbackIds } from './util.js'

function backfillLightTransition(
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

function migrateV2EntityIds(
	_context: CompanionUpgradeContext<ModuleConfig>,
	props: CompanionStaticUpgradeProps<ModuleConfig, ModuleSecrets>,
): CompanionStaticUpgradeResult<ModuleConfig, ModuleSecrets> {
	const actionEntityTypes: Record<string, string> = {
		[ActionId.ButtonPush]: 'button',
		[ActionId.FanState]: 'fan',
		[ActionId.LightState]: 'light',
		[ActionId.LightBrightness]: 'light',
		[ActionId.SwitchState]: 'switch',
	}

	const prefixedActionEntityTypes: ReadonlyArray<readonly [string, string]> = [
		[PrefixedActionIds.ClimateMode, 'climate'],
		[PrefixedActionIds.CoverPosition, 'cover'],
		[PrefixedActionIds.LockCommand, 'lock'],
		[PrefixedActionIds.NumberState, 'number'],
		[PrefixedActionIds.SelectState, 'select'],
	]

	const feedbackEntityTypes: Record<string, string> = {
		[FeedbackId.BinarySensorState]: 'binary_sensor',
		[FeedbackId.ClimateMode]: 'climate',
		[FeedbackId.CoverOpen]: 'cover',
		[FeedbackId.FanState]: 'fan',
		[FeedbackId.LightState]: 'light',
		[FeedbackId.LockState]: 'lock',
		[FeedbackId.NumberState]: 'number',
		[FeedbackId.SensorState]: 'sensor',
		[FeedbackId.SwitchState]: 'switch',
		[FeedbackId.TextSensorValue]: 'text_sensor',
	}

	const prefixedFeedbackEntityTypes: ReadonlyArray<readonly [string, string]> = [
		[PrefixedFeedbackIds.SelectState, 'select'],
	]

	function prefixEntityId(raw: string, entityType: string): string {
		if (!raw || raw.startsWith(`${entityType}-`)) return raw
		return `${entityType}-${raw}`
	}

	function rewriteEntityIdOption(options: Record<string, any>, entityType: string): boolean {
		const current = options.entity_id
		if (typeof current === 'string') {
			const next = prefixEntityId(current, entityType)
			if (next !== current) {
				options.entity_id = next
				return true
			}
			return false
		}

		if (typeof current === 'object' && current !== null && !current.isExpression && typeof current.value === 'string') {
			const next = prefixEntityId(current.value, entityType)
			if (next !== current.value) {
				current.value = next
				return true
			}
		}
		return false
	}

	function rewritePrefixedId(id: string, prefixMap: ReadonlyArray<readonly [string, string]>): string | undefined {
		for (const [prefix, entityType] of prefixMap) {
			if (id.startsWith(prefix)) {
				const suffix = id.slice(prefix.length)
				const nextSuffix = prefixEntityId(suffix, entityType)
				return nextSuffix !== suffix ? `${prefix}${nextSuffix}` : undefined
			}
		}
		return undefined
	}

	const updatedActions = []
	for (const action of props.actions) {
		let changed = false
		const entityType = actionEntityTypes[action.actionId]
		if (entityType) {
			changed = rewriteEntityIdOption(action.options, entityType)
		} else {
			const nextActionId = rewritePrefixedId(action.actionId, prefixedActionEntityTypes)
			if (nextActionId) {
				action.actionId = nextActionId
				changed = true
			}
		}
		if (changed) {
			updatedActions.push(action)
		}
	}

	const updatedFeedbacks = []
	for (const feedback of props.feedbacks) {
		let changed = false
		const entityType = feedbackEntityTypes[feedback.feedbackId]
		if (entityType) {
			changed = rewriteEntityIdOption(feedback.options, entityType)
		} else {
			const nextFeedbackId = rewritePrefixedId(feedback.feedbackId, prefixedFeedbackEntityTypes)
			if (nextFeedbackId) {
				feedback.feedbackId = nextFeedbackId
				changed = true
			}
		}
		if (changed) {
			updatedFeedbacks.push(feedback)
		}
	}

	return {
		updatedConfig: null,
		updatedActions,
		updatedFeedbacks,
	}
}

export const UpgradeScripts: CompanionStaticUpgradeScript<ModuleConfig, ModuleSecrets>[] = [
	backfillLightTransition,
	migrateV2EntityIds,
]
