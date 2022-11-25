import { InstanceBase, CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { PrefixedActionIds, FeedbackId } from '../util'
import Lock from '../entities/LockEntity'
import { EntityPicker } from '../choices'
import { LockCommand, LockState } from '../proto/api'

export const LockAdapter: EntityAdapter<Lock> = {
	is: (instance: any): instance is Lock => {
		return instance instanceof Lock
	},

	createActions: (client: EsphomeClient): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		client.getAll(LockAdapter).forEach((lock) => {
			const options = [
				{ id: LockCommand.LOCK_LOCK, label: 'Lock' },
				{ id: LockCommand.LOCK_UNLOCK, label: 'Unlock' },
			]
			if (lock.supportsOpen) {
				options.push({ id: LockCommand.LOCK_OPEN, label: 'Open' })
			}
			actions[PrefixedActionIds.LockCommand + lock.id] = {
				name: `${lock.name}: Set lock state`,
				options: [
					{
						type: 'dropdown',
						label: 'State',
						id: 'state',
						default: LockCommand.LOCK_LOCK,
						choices: options,
					},
				],
				callback: (evt): void => {
					lock.setLockCommand(evt.options.value as LockCommand)
				},
			}
		})
		return actions
	},

	createFeedbacks: (instance: InstanceBase<any>, client: EsphomeClient): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const entities = client.getAll(LockAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.LockState] = {
				type: 'boolean',
				name: 'Change from lock state',
				description: 'If the lock state matches the rule, change style of the bank',
				options: [
					EntityPicker(entities),
					{
						type: 'dropdown',
						label: 'State',
						id: 'state',
						default: LockState.LOCKED,
						choices: [
							{ id: LockState.LOCKED, label: 'Locked' },
							{ id: LockState.UNLOCKED, label: 'Unocked' },
							{ id: LockState.LOCKING, label: 'Locking' },
							{ id: LockState.UNLOCKING, label: 'Unlocking' },
							{ id: LockState.JAMMED, label: 'Jammed' },
							{ id: LockState.NONE, label: 'None' },
						],
					},
				],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => {
					const entity = client.getEntity(String(feedback.options.entity_id), LockAdapter)
					if (entity) {
						return entity.isState(feedback.options.state as LockState)
					}
					return false
				},
			}
		}
		return feedbacks
	},
}
