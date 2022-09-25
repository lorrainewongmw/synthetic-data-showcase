/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { IAggregatedMetricByString } from '@essex/sds-core'
import type { TooltipItem } from 'chart.js'

export interface ContributionChartProps {
	selectedKey?: string
	valuePerKey: IAggregatedMetricByString
	label: string
	containerHeight: number | string
	barHeight: number
	tooltipFormatter?: (item: TooltipItem<'bar'>) => string
	onClick?: (key: string) => void
}
