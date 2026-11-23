import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { LockCommand, LockEntity, LockState } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makePresetSection, makeSimplePreset } from './base.js'
import { PrefixedActionIds, FeedbackId } from '../util.js'
import { EntityPicker } from '../choices.js'
import { entityVariableId } from '../variables.js'

export const LockAdapter: EntityAdapter<LockEntity> = {
	is: (instance: unknown): instance is LockEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'lock'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const locks = client.getEntities('lock')
		for (const entity of locks) {
			const lockEntity = entity as unknown as LockEntity & { id: string }
			const choices: Array<{ id: number; label: string }> = [
				{ id: LockCommand.LOCK, label: 'Lock' },
				{ id: LockCommand.UNLOCK, label: 'Unlock' },
			]
			if (lockEntity.supportsOpen) {
				choices.push({ id: LockCommand.OPEN, label: 'Open' })
			}
			actions[PrefixedActionIds.LockCommand + lockEntity.id] = {
				name: `${lockEntity.name || lockEntity.id}: Set lock state`,
				options: [
					{
						type: 'dropdown',
						label: 'State',
						id: 'state',
						default: LockCommand.LOCK,
						choices,
					},
				],
				callback: (evt): void => {
					client.command(lockEntity.id, { command: Number(evt.options.state) })
				},
			}
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const locks = client.getEntities('lock')
		if (locks.length) {
			feedbacks[FeedbackId.LockState] = {
				type: 'boolean',
				name: 'Change from lock state',
				description: 'True when the lock state matches the rule',
				options: [
					EntityPicker(locks),
					{
						type: 'dropdown',
						label: 'State',
						id: 'state',
						default: LockState.LOCKED,
						choices: [
							{ id: LockState.LOCKED, label: 'Locked' },
							{ id: LockState.UNLOCKED, label: 'Unlocked' },
							{ id: LockState.LOCKING, label: 'Locking' },
							{ id: LockState.UNLOCKING, label: 'Unlocking' },
							{ id: LockState.JAMMED, label: 'Jammed' },
							{ id: LockState.OPENING, label: 'Opening' },
							{ id: LockState.OPEN, label: 'Open' },
							{ id: LockState.NONE, label: 'None' },
						],
					},
				],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const event = client.latest(feedback.options.entity_id as string)
					if (!event) return false
					const currentState = event.state ?? LockState.NONE
					return currentState === feedback.options.state
				},
			}
		}
		return feedbacks
	},

	createPresets: (client: EsphomeWrapper): AdapterPresets => {
		const presets: AdapterPresets['presets'] = {}
		const ids: string[] = []
		for (const entity of client.getEntities('lock')) {
			const lockId = `preset_${entityVariableId(entity.id)}_lock`
			presets[lockId] = makeSimplePreset(
				`${entity.name || entity.id} Lock`,
				`${entity.name || entity.id}\nLock`,
				[
					{
						down: [{ actionId: PrefixedActionIds.LockCommand + entity.id, options: { state: LockCommand.LOCK } }],
						up: [],
					},
				],
				[
					{
						feedbackId: FeedbackId.LockState,
						options: { entity_id: entity.id, state: LockState.LOCKED },
						style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					},
				],
			)
			const unlockId = `preset_${entityVariableId(entity.id)}_unlock`
			presets[unlockId] = makeSimplePreset(
				`${entity.name || entity.id} Unlock`,
				`${entity.name || entity.id}\nUnlock`,
				[
					{
						down: [{ actionId: PrefixedActionIds.LockCommand + entity.id, options: { state: LockCommand.UNLOCK } }],
						up: [],
					},
				],
				[
					{
						feedbackId: FeedbackId.LockState,
						options: { entity_id: entity.id, state: LockState.UNLOCKED },
						style: { color: combineRgb(0, 0, 0), bgcolor: combineRgb(0, 255, 0) },
					},
				],
			)
			ids.push(lockId, unlockId)
		}
		return { sections: makePresetSection('locks', 'Locks', ids), presets }
	},
}
