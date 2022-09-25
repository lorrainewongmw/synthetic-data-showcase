/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { IStackTokens } from '@fluentui/react'
import { Label, Stack, useTheme } from '@fluentui/react'
import { memo } from 'react'
import styled from 'styled-components'

import { useActualNominalColor, useEstimatedNominalColor } from './hooks.js'

export const AttributeIntersectionValueChartLegend: React.FC = memo(
	function AttributeIntersectionValueChartLegend() {
		const theme = useTheme()
		const stackTokens: IStackTokens = {
			childrenGap: theme.spacing.s1,
		}
		const estimatedColor = useEstimatedNominalColor()
		const actualColor = useActualNominalColor()

		return (
			<Stack
				horizontal
				tokens={stackTokens}
				horizontalAlign="center"
				verticalAlign="center"
			>
				<ColorLegend color={estimatedColor} />
				<ColorLabel>Synthetic</ColorLabel>
				<ColorLegend color={actualColor} />
				<ColorLabel>Aggregate</ColorLabel>
			</Stack>
		)
	},
)

const ColorLegend = styled.div`
	width: 40px;
	height: 12px;
	background-color: ${props => props.color};
`

const ColorLabel = styled(Label)`
	font-weight: normal;
`
