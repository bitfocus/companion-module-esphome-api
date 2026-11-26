import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { LockCommand, LockEntity, LockState } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { AdapterPresets, EntityAdapter, makeLayeredFeedback, makeLayeredIconPreset, makePresetSection } from './base.js'
import { PrefixedActionIds, FeedbackId } from '../util.js'
import { EntityPicker } from '../choices.js'
import { entityVariableId } from '../variables.js'

export const LockAdapter: EntityAdapter<LockEntity> = {
	entityType: 'lock',

	is: (instance: unknown): instance is LockEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'lock'
	},

	getFeedbackIds: (): string[] => [FeedbackId.LockState],

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
			const actionOptions: any[] = [
				{
					type: 'dropdown',
					label: 'State',
					id: 'state',
					default: LockCommand.LOCK,
					choices,
				},
			]
			if (lockEntity.requiresCode) {
				actionOptions.push({
					type: 'textinput',
					label: 'Code',
					id: 'code',
					default: '',
				})
			}
			actions[PrefixedActionIds.LockCommand + lockEntity.id] = {
				name: `${lockEntity.name || lockEntity.id}: Set lock state`,
				options: actionOptions,
				callback: (evt): void => {
					const cmd: Record<string, unknown> = { command: Number(evt.options.state) }
					if (lockEntity.requiresCode && evt.options.code) {
						cmd.code = evt.options.code
					}
					client.command(lockEntity.id, cmd)
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
			const lockEntity = entity as unknown as LockEntity & { id: string }
			const label = lockEntity.name || lockEntity.id
			const varId = entityVariableId(lockEntity.id)

			const lockId = `preset_${varId}_lock`
			presets[lockId] = makeLayeredIconPreset({
				name: `${label} Lock`,
				text: `${label}\nLock`,
				icon: 'lock',
				steps: [
					{
						down: [{ actionId: PrefixedActionIds.LockCommand + lockEntity.id, options: { state: LockCommand.LOCK } }],
						up: [],
					},
				],
				feedbacks: [
					makeLayeredFeedback({
						feedbackId: FeedbackId.LockState,
						options: { entity_id: lockEntity.id, state: LockState.LOCKED },
						bgcolor: combineRgb(0, 255, 0),
						icon: 'lock',
					}),
					makeLayeredFeedback({
						feedbackId: FeedbackId.LockState,
						options: { entity_id: lockEntity.id, state: LockState.LOCKING },
						bgcolor: combineRgb(255, 191, 0),
						icon: 'lock',
					}),
					makeLayeredFeedback({
						feedbackId: FeedbackId.LockState,
						options: { entity_id: lockEntity.id, state: LockState.JAMMED },
						bgcolor: combineRgb(200, 0, 0),
						icon: 'lock-alert',
					}),
				],
			})

			const unlockId = `preset_${varId}_unlock`
			presets[unlockId] = makeLayeredIconPreset({
				name: `${label} Unlock`,
				text: `${label}\nUnlock`,
				icon: 'lock-open',
				steps: [
					{
						down: [{ actionId: PrefixedActionIds.LockCommand + lockEntity.id, options: { state: LockCommand.UNLOCK } }],
						up: [],
					},
				],
				feedbacks: [
					makeLayeredFeedback({
						feedbackId: FeedbackId.LockState,
						options: { entity_id: lockEntity.id, state: LockState.UNLOCKED },
						bgcolor: combineRgb(0, 255, 0),
						icon: 'lock-open',
					}),
					makeLayeredFeedback({
						feedbackId: FeedbackId.LockState,
						options: { entity_id: lockEntity.id, state: LockState.UNLOCKING },
						bgcolor: combineRgb(255, 191, 0),
						icon: 'lock-open',
					}),
					makeLayeredFeedback({
						feedbackId: FeedbackId.LockState,
						options: { entity_id: lockEntity.id, state: LockState.JAMMED },
						bgcolor: combineRgb(200, 0, 0),
						icon: 'lock-alert',
					}),
				],
			})
			ids.push(lockId, unlockId)

			if (lockEntity.supportsOpen) {
				const openId = `preset_${varId}_open`
				presets[openId] = makeLayeredIconPreset({
					name: `${label} Open`,
					text: `${label}\nOpen`,
					icon: 'door-open',
					steps: [
						{
							down: [{ actionId: PrefixedActionIds.LockCommand + lockEntity.id, options: { state: LockCommand.OPEN } }],
							up: [],
						},
					],
					feedbacks: [
						makeLayeredFeedback({
							feedbackId: FeedbackId.LockState,
							options: { entity_id: lockEntity.id, state: LockState.OPEN },
							bgcolor: combineRgb(0, 255, 0),
							icon: 'door-open',
						}),
						makeLayeredFeedback({
							feedbackId: FeedbackId.LockState,
							options: { entity_id: lockEntity.id, state: LockState.OPENING },
							bgcolor: combineRgb(255, 191, 0),
							icon: 'door-open',
						}),
						makeLayeredFeedback({
							feedbackId: FeedbackId.LockState,
							options: { entity_id: lockEntity.id, state: LockState.JAMMED },
							bgcolor: combineRgb(200, 0, 0),
							icon: 'lock-alert',
						}),
					],
				})
				ids.push(openId)
			}
		}
		return { sections: makePresetSection('locks', 'Locks', ids), presets }
	},
}
