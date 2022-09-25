/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import init, { init_logger, WasmSdsContext } from '@essex/sds-core'
import wasmPath from '@essex/sds-core/sds_wasm_bg.wasm?url'

import { getSdsWasmLogLevel } from '../utils/env.js'

export class BaseSdsWasmWorker {
	private _context: WasmSdsContext | null
	protected _name: string

	constructor(name: string) {
		this._context = null
		this._name = name
	}

	public async init(): Promise<void> {
		await init(wasmPath)
		init_logger(getSdsWasmLogLevel())
		this._context = new WasmSdsContext()
	}

	public async terminate(): Promise<void> {
		this._context?.free()
	}

	protected getContext(): WasmSdsContext {
		if (this._context === null) {
			throw new Error(
				`"${this._name}" worker has not been properly initialized, did you call init?`,
			)
		}
		return this._context
	}
}
