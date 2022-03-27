import InstanceSkel = require('../../../instance_skel')
import { CompanionFeedbacks } from '../../../instance_skel_types'
import { EntityAdapters } from './entityAdapters'
import { EsphomeClient } from './esphomeClient'

export function GetFeedbacksList(instance: InstanceSkel<any>, client: EsphomeClient): CompanionFeedbacks {
	const feedbacks = {}

	Object.values(EntityAdapters).forEach((adapter) => {
		Object.assign(feedbacks, adapter.createFeedbacks(instance, client))
	})

	return feedbacks
}
