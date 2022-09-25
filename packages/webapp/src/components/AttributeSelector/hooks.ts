/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type {
	IAttributesIntersection,
	ISelectedAttributesByColumn,
} from '@essex/sds-core'
import _ from 'lodash'
import { useMemo } from 'react'

export function useMaxCount(items: IAttributesIntersection[]): number {
	return useMemo(
		() =>
			Number(
				_.max([
					_.maxBy(items, item => item.estimatedCount)?.estimatedCount,
					_.maxBy(items, item => item.actualCount ?? 0)?.actualCount,
				]),
			) ?? 1,
		[items],
	)
}

export function useSelectedAttributesByColumnEntries(
	selectedAttributesByColumn: ISelectedAttributesByColumn,
): [string, Set<string>][] {
	return useMemo(
		() => Object.entries(selectedAttributesByColumn),
		[selectedAttributesByColumn],
	)
}
