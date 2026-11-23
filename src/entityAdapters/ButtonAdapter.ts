import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { ButtonEntity } from 'esphome-client'
import { EsphomeWrapper } from '../esphomeWrapper.js'
import { EntityAdapter } from './base.js'
import { ActionId } from '../util.js'
import { EntityPicker } from '../choices.js'

export const ButtonAdapter: EntityAdapter<ButtonEntity> = {
	is: (instance: unknown): instance is ButtonEntity => {
		return typeof instance === 'object' && instance !== null && (instance as any).type === 'button'
	},

	createActions: (client: EsphomeWrapper): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const buttons = client.getEntities('button')
		if (buttons.length) {
			actions[ActionId.ButtonPush] = {
				name: 'Push Button',
				options: [EntityPicker(buttons)],
				callback: (evt): void => {
					client.command(evt.options.entity_id as string, {})
				},
			}
		}
		return actions
	},

	createFeedbacks: (_client: EsphomeWrapper): CompanionFeedbackDefinitions => {
		return {}
	},
}
