/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { PrepareDataFull } from '@data-wrangling-components/react'
import { Icon, useTheme } from '@fluentui/react'
import { FlexContainer, useFileDropOpen } from '@sds/components'
import { memo } from 'react'
import styled from 'styled-components'

import { InfoTooltip } from '~components/InfoTooltip'
import { PageDescription, Pages } from '~pages'
import { useSelectedTable, useSteps, useTables } from '~states'
import { tooltips } from '~ui-tooltips'

export const DataInput: React.FC = memo(function DataInput() {
	const theme = useTheme()
	const open = useFileDropOpen()
	const [tables] = useTables()
	const [steps, setSteps] = useSteps()
	const [, updateSelectedTable] = useSelectedTable()

	return (
		<Container vertical>
			<PageDescription>{Pages.Prepare.description}</PageDescription>
			<FlexContainer
				align="center"
				style={{ margin: theme.spacing.m }}
				gap={theme.spacing.s1}
			>
				<StyledOpen onClick={open}>
					<Icon iconName="OpenFolderHorizontal" /> Open sensitive data file
				</StyledOpen>
				<InfoTooltip title="Open sensitive data file">
					{tooltips.sensitiveFile}
				</InfoTooltip>
			</FlexContainer>
			{!!tables.length && (
				<Container>
					<PrepareDataFull
						tables={tables}
						steps={steps}
						onUpdateSteps={setSteps}
						onOutputTable={updateSelectedTable}
						stepsPosition="middle"
					/>
				</Container>
			)}
		</Container>
	)
})

const StyledOpen = styled.span`
	color: ${p => p.theme.palette.accent};
	&:hover {
		cursor: pointer;
	}
`

/// temporary fix for button text overflow until dwc version is updated
const Container = styled(FlexContainer)`
	height: 100%;
	overflow-y: auto;

	.ms-Button-textContainer {
		overflow: hidden;
	}

	.ms-Button-label {
		text-overflow: ellipsis;
		overflow: hidden;
	}
`
