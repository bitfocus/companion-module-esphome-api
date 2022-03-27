import InstanceSkel from '../../../../instance_skel'
import { CompanionActions, CompanionFeedbacks } from '../../../../instance_skel_types'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { ActionId } from '../util'
import Button from '../entities/ButtonEntity'
import { EntityPicker } from '../choices'

export const ButtonAdapter: EntityAdapter<Button> = {
	is: (instance: any): instance is Button => {
		return instance instanceof Button
	},

	createActions: (client: EsphomeClient): CompanionActions => {
		const actions: CompanionActions = {}
		const buttonEntities = client.getAll(ButtonAdapter)
		if (buttonEntities.length) {
			actions[ActionId.ButtonPush] = {
				label: 'Push Button',
				options: [EntityPicker(buttonEntities)],
				callback: (evt): void => {
					const id = evt.options.entity_id as string
					client.getEntity(id, ButtonAdapter)?.push()
				},
			}
		}
		return actions
	},

	createFeedbacks: (instance: InstanceSkel<any>, client: EsphomeClient): CompanionFeedbacks => {
		return {}
	},
}
