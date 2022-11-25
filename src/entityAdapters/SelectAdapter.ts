import { CompanionActionDefinitions, CompanionFeedbackDefinitions, combineRgb } from '@companion-module/base'
import { EsphomeClient } from '../esphomeClient'
import { EntityAdapter } from './base'
import { PrefixedActionIds, PrefixedFeedbackIds } from '../util'
import Select from '../entities/SelectEntity'

export const SelectAdapter: EntityAdapter<Select> = {
	is: (instance: unknown): instance is Select => {
		return instance instanceof Select
	},

	createActions: (client: EsphomeClient): CompanionActionDefinitions => {
		const actions: CompanionActionDefinitions = {}
		client.getAll(SelectAdapter).forEach((select) => {
			const options = select.options.map((o) => ({ id: o, label: o }))
			actions[PrefixedActionIds.SelectState + select.id] = {
				name: `${select.name}: Set select state`,
				options: [
					{
						type: 'dropdown',
						label: 'State',
						id: 'state',
						default: options[0].id,
						choices: options,
					},
				],
				callback: (evt): void => {
					if (typeof evt.options.state === 'string') {
						select.setState(evt.options.state)
					}
				},
			}
		})
		return actions
	},

	createFeedbacks: (client: EsphomeClient): CompanionFeedbackDefinitions => {
		const feedbacks: CompanionFeedbackDefinitions = {}
		client.getAll(SelectAdapter).forEach((select) => {
			const options = select.options.map((o) => ({ id: o, label: o }))
			feedbacks[PrefixedFeedbackIds.SelectState + select.id] = {
				type: 'boolean',
				name: `${select.name}: Change from select state`,
				description: 'If the select state matches the rule, change style of the bank',
				options: [
					{
						type: 'dropdown',
						label: 'State',
						id: 'state',
						default: options[0] && options[0].id,
						choices: options,
					},
				],
				defaultStyle: {
					color: combineRgb(0, 0, 0),
					bgcolor: combineRgb(0, 255, 0),
				},
				callback: (feedback): boolean => select.isState(String(feedback.options.state)),
			}
		})
		return feedbacks
	},
}
