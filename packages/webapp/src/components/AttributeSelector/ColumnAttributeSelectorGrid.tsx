/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { Stack, useTheme } from '@fluentui/react'
import { memo } from 'react'
import { HeaderNames, ISelectedAttributesByColumn } from 'sds-wasm'
import { ColumnAttributeSelector } from './ColumnAttributeSelector'
import { AttributeIntersectionValueChartLegend } from '~components/AttributeIntersectionValueChartLegend'
import { useHorizontalScrolling } from '~components/Charts/hooks'
import { SetSelectedAttributesCallback } from '~components/Pages/DataShowcasePage/DataNavigation'

export interface ColumnAttributeSelectorGridProps {
	viewHeight: string | number
	headers: HeaderNames
	selectedHeaders: boolean[]
	chartHeight: string | number
	chartWidth: string | number
	chartBarHeight: number
	chartMinHeight?: string | number
	selectedAttributesByColumn: ISelectedAttributesByColumn
	onSetSelectedAttributes: SetSelectedAttributesCallback
}

export const ColumnAttributeSelectorGrid: React.FC<ColumnAttributeSelectorGridProps> =
	memo(function ColumnAttributeSelectorGrid({
		viewHeight,
		headers,
		selectedHeaders,
		chartHeight,
		chartWidth,
		chartBarHeight,
		chartMinHeight,
		selectedAttributesByColumn,
		onSetSelectedAttributes,
	}: ColumnAttributeSelectorGridProps) {
		const theme = useTheme()
		const doHorizontalScroll = useHorizontalScrolling()

		return (
			<Stack>
				<AttributeIntersectionValueChartLegend />
				<Stack
					wrap
					tokens={{
						childrenGap: theme.spacing.m,
					}}
					styles={{
						root: {
							height: viewHeight,
							overflowY: 'hidden',
							padding: theme.spacing.s1,
						},
					}}
					onWheel={doHorizontalScroll}
					verticalAlign="space-between"
				>
					{headers.map((h, i) => {
						return (
							selectedHeaders[i] && (
								<Stack.Item key={i}>
									<ColumnAttributeSelector
										headerName={h}
										columnIndex={i}
										height={chartHeight}
										width={chartWidth}
										chartBarHeight={chartBarHeight}
										minHeight={chartMinHeight}
										selectedAttributes={
											selectedAttributesByColumn[i] ?? new Set()
										}
										onSetSelectedAttributes={onSetSelectedAttributes}
									/>
								</Stack.Item>
							)
						)
					})}
				</Stack>
			</Stack>
		)
	})
