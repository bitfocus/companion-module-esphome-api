import InstanceSkel from '../../../../instance_skel'
import { CompanionActions, CompanionFeedbacks } from '../../../../instance_skel_types'
import { EsphomeClient } from '../esphomeClient'

export interface EntityAdapter<T> {
	is(instance: any): instance is T
	createActions(client: EsphomeClient): CompanionActions
	createFeedbacks(instance: InstanceSkel<any>, client: EsphomeClient): CompanionFeedbacks
}
