/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { IMultiValueColumns } from '@essex/sds-core'
import { fromCSV, table } from 'arquero'
import type ColumnTable from 'arquero/dist/types/table/column-table'

import type { ICsvContent, ICsvTableHeader } from '~models'

/**
 * Create a table from a set of compute results.
 * @param rows
 * @returns
 */
export function fromCsvData(
	csv_data: string | undefined,
	delimiter = ',',
	typeInferenceProportion = 0.2,
): ColumnTable {
	if (csv_data) {
		const length = (csv_data.match(/\n/g) || []).length

		if (length > 1) {
			return fromCSV(csv_data, {
				delimiter,
				autoMax: Math.ceil(length * typeInferenceProportion),
			})
		}
	}
	return table({})
}

/**
 * Returns a list of column indices that contain at least one 0.
 * @param table
 */
export function columnIndexesWithZeros(table: ColumnTable): number[] {
	return table.columnNames().reduce((acc, name, idx) => {
		const values = table.array(name)
		if (values.some(v => v?.toString()?.includes('0'))) {
			acc.push(idx)
		}
		return acc
	}, [] as number[])
}

/**
 * Creates a default set of header config based on the table
 * @param table
 * @param existing - optional existing headers to check for completion
 * @returns
 */
export function tableHeaders(
	table: ColumnTable,
	existing?: ICsvTableHeader[],
): ICsvTableHeader[] {
	const hash = (existing || []).reduce((acc, cur) => {
		acc[cur.name] = cur
		return acc
	}, {} as Record<string, ICsvTableHeader>)
	return table.columnNames().map((h, i) =>
		hash[h]
			? hash[h]
			: ({
					name: h,
					fieldName: i.toString(),
					use: false,
					hasSensitiveZeros: false,
					spreadWithDelimiter: null,
			  } as ICsvTableHeader),
	)
}

/**
 * Get a list of column names from the table
 * @param table
 * @param onlyUsed
 */
export function usableHeaders(data: ICsvContent): ICsvTableHeader[] {
	return data.headers.filter(h => h.use && h.name !== data.subjectId)
}

/**
 * Get an object mapping the multi value columns in data (Column Name -> Delimiter)
 * @param table
 * @param onlyUsed
 */
export function usableMultiValueColumns(data: ICsvContent): IMultiValueColumns {
	const ret = {}

	data.headers
		.filter(
			h => h.use && h.name !== data.subjectId && h.spreadWithDelimiter !== null,
		)
		.forEach(h => {
			ret[h.name] = h.spreadWithDelimiter
		})
	return ret
}

/**
 * Get a list of column names that contains sensitive zeros
 * @param data
 */
export function sensitiveZeros(data: ICsvContent): string[] {
	return data.headers.filter(h => h.hasSensitiveZeros).map(h => h.name)
}
