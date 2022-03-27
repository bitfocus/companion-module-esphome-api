import InstanceSkel from '../../../../instance_skel'
import { CompanionActions, CompanionFeedbacks } from '../../../../instance_skel_types'
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

	createActions: (client: EsphomeClient): CompanionActions => {
		const actions: CompanionActions = {}
		client.getAll(LockAdapter).forEach((lock) => {
			const options = [
				{ id: LockCommand.LOCK_LOCK, label: 'Lock' },
				{ id: LockCommand.LOCK_UNLOCK, label: 'Unlock' },
			]
			if (lock.supportsOpen) {
				options.push({ id: LockCommand.LOCK_OPEN, label: 'Open' })
			}
			actions[PrefixedActionIds.LockCommand + lock.id] = {
				label: `${lock.name}: Set lock state`,
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

	createFeedbacks: (instance: InstanceSkel<any>, client: EsphomeClient): CompanionFeedbacks => {
		const feedbacks: CompanionFeedbacks = {}
		const entities = client.getAll(LockAdapter)
		if (entities.length) {
			feedbacks[FeedbackId.LockState] = {
				type: 'boolean',
				label: 'Change from lock state',
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
				style: {
					color: instance.rgb(0, 0, 0),
					bgcolor: instance.rgb(0, 255, 0),
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
