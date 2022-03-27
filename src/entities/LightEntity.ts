import { StatefulEntity } from './base'
import { EsphomeSocket } from '../connection/esphomeSocket'
import { ListEntitiesLightResponse, LightCommandRequest, LightStateResponse, ColorMode } from '../proto/api'

export default class Light extends StatefulEntity<ListEntitiesLightResponse, LightStateResponse> {
	static subscribe(socket: EsphomeSocket, newEntityCallback: (entity: Light) => void) {
		socket.addMessageListener(ListEntitiesLightResponse, (config) => {
			const instance = new Light(socket, config)
			newEntityCallback(instance)
		})
	}

	constructor(socket: EsphomeSocket, config: ListEntitiesLightResponse) {
		super(socket, config, LightStateResponse)
	}

	get supportsBrightness() {
		return this.config.supportedColorModes.includes(ColorMode.BRIGHTNESS) || this.config.legacySupportsBrightness
	}

	get isOn(): boolean {
		return this._state.state
	}

	private command(data: Partial<LightCommandRequest>) {
		this.socket.writeRequest(LightCommandRequest, { ...data, key: this.config.key })
	}

	setState(state: boolean) {
		this.command({ state, hasState: true })
	}

	setBrightness(brightness: number) {
		this.command({
			colorMode: ColorMode.BRIGHTNESS,
			hasColorMode: true,
			brightness: brightness,
			hasBrightness: true,
			state: true,
			hasState: true,
		})
	}
}
