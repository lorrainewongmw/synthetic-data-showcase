/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { useTheme } from '@fluentui/react'
import { memo, useCallback } from 'react'

import { StatefulAllSynthesisInfo } from '~components/AllSynthesisInfo'
import { CollapsablePanel } from '~components/CollapsablePanel/CollapsablePanel'
import { useCanRun } from '~pages/hooks'
import {
	useGlobalErrorMessage,
	useSelectedSynthesisInfo,
	useSensitiveContentValue,
} from '~states'
import { IWasmSynthesizerWorkerStatus } from '~workers/types'

import { DataSynthesisParameters } from '../DataSynthesisParameters/index.js'
import { DataSynthesisResult } from '../DataSynthesisResult/index.js'
import { useOnRunGenerateAndEvaluate } from './DataSynthesis.hooks.js'
import { Container } from './DataSynthesis.styles.js'

export const DataSynthesis: React.FC = memo(function DataSynthesis() {
	const theme = useTheme()
	const canRun = useCanRun()
	const sensitiveContent = useSensitiveContentValue()
	const [selectedSynthesis] = useSelectedSynthesisInfo()
	const [, setGlobalErrorMessage] = useGlobalErrorMessage()

	const onRunGenerateAndEvaluate = useOnRunGenerateAndEvaluate()

	const onRun = useCallback(
		async rawParams => {
			try {
				await onRunGenerateAndEvaluate(rawParams)
				setGlobalErrorMessage(undefined)
			} catch (err) {
				setGlobalErrorMessage(`${err}`)
			}
		},
		[onRunGenerateAndEvaluate, setGlobalErrorMessage],
	)

	return (
		<Container vertical gap={theme.spacing.s1}>
			<DataSynthesisParameters
				enableRun={canRun}
				sensitiveCsvContent={sensitiveContent}
				onRun={onRun}
			/>

			<CollapsablePanel header={<h3>Results</h3>} defaultCollapsed>
				<StatefulAllSynthesisInfo />
			</CollapsablePanel>

			{selectedSynthesis?.status === IWasmSynthesizerWorkerStatus.FINISHED && (
				<DataSynthesisResult selectedSynthesis={selectedSynthesis} />
			)}
		</Container>
	)
})
