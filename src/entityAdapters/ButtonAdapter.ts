import { CompanionActionDefinitions, CompanionFeedbackDefinitions } from '@companion-module/base'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { ActionId } from '../util'
import Button from '../entities/ButtonEntity'
import { EntityPicker } from '../choices'

export const ButtonAdapter: EntityAdapter<Button> = {
	is: (instance: any): instance is Button => {
		return instance instanceof Button
	},

	createActions: (client: EsphomeClient): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		const buttonEntities = client.getAll(ButtonAdapter)
		if (buttonEntities.length) {
			actions[ActionId.ButtonPush] = {
				name: 'Push Button',
				options: [EntityPicker(buttonEntities)],
				callback: (evt): void => {
					const id = evt.options.entity_id as string
					client.getEntity(id, ButtonAdapter)?.push()
				},
			}
		}
		return actions
	},

	createFeedbacks: (client: EsphomeClient): CompanionFeedbackDefinitions => {
		return {}
	},
}
