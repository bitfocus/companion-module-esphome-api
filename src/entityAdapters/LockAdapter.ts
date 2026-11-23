import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { LockEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { PrefixedActionIds, FeedbackId } from '../util.js'

export const LockAdapter: EntityAdapter<LockEntity> = {
	is: (instance: unknown): instance is LockEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'lock'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const lockEntities = client.getAvailableEntityIds()['lock'] || []
		if (lockEntities.length) {
			lockEntities.forEach((entityId: string) => {
				const options = [
					{ id: 1, label: 'Lock' },
					{ id: 2, label: 'Unlock' },
				]
				if ((client as any).getEntity(entityId)?.supportsOpen) {
					options.push({ id: 3, label: 'Open' })
				}
				actions[PrefixedActionIds.LockCommand + entityId] = {
					name: `${entityId}: Set lock state`,
					options: [
						{
							type: 'dropdown',
							label: 'State',
							id: 'state',
							default: 1,
							choices: options,
						},
					],
					callback: (evt): void => {
						client.command(evt.options.entity_id as string, { command: evt.options.state })
					},
				}
			})
		}
		return actions
	},

	createFeedbacks: (client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		const locks = client.getAvailableEntityIds()['lock'] || []
		if (locks.length) {
			locks.forEach((entityId: string) => {
				feedbacks[FeedbackId.LockState + entityId] = {
					type: 'boolean',
					name: `${entityId}: Change from lock state`,
					description: 'True when the lock state matches the rule',
					options: [
						{
							type: 'dropdown',
							label: 'Entity',
							id: 'entity_id',
							default: entityId,
							choices: [{ id: entityId, label: entityId }],
						},
						{
							type: 'dropdown',
							label: 'State',
							id: 'state',
							default: 1,
							choices: [
								{ id: 1, label: 'Locked' },
								{ id: 2, label: 'Unlocked' },
								{ id: 3, label: 'Locking' },
								{ id: 4, label: 'Unlocking' },
								{ id: 5, label: 'Jammed' },
								{ id: 6, label: 'None' },
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
						return event.state === feedback.options.state
					},
				}
			})
		}
		return feedbacks
	},
}
