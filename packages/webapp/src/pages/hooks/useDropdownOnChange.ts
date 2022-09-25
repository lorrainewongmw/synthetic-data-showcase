/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { IDropdownOption } from '@fluentui/react'
import { useCallback } from 'react'

export function useDropdownOnChange<T>(
	setter: (val: T) => void,
): (event: React.FormEvent<HTMLDivElement>, item?: IDropdownOption) => void {
	return useCallback(
		(event: React.FormEvent<HTMLDivElement>, item?: IDropdownOption) => {
			if (item) {
				setter(item.key as unknown as T)
			}
		},
		[setter],
	)
}
