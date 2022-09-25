/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	IconButton,
	Panel,
	Position,
	PrimaryButton,
	useTheme,
} from '@fluentui/react'
import { useBoolean } from '@fluentui/react-hooks'
import { FlexContainer, FlexItem } from '@sds/components'
import { memo, useEffect } from 'react'

import { InfoTooltip } from '~components/InfoTooltip'
import { TooltipWrapper } from '~components/TooltipWrapper'
import { useDropdownOnChange, useSpinButtonOnChange } from '~pages/hooks'
import {
	useRawSynthesisParameters,
	useRawSynthesisParametersPropertySetter,
} from '~states'
import { tooltips } from '~ui-tooltips'
import { SynthesisMode } from '~workers/types'

import { DataSynthesisAdvancedParameters } from './DataSynthesisAdvancedParameters.js'
import {
	useSynthesisModeOptions,
	useUpdateNoisyCountThreshold,
} from './DataSynthesisParameters.hooks.js'
import {
	StyledDropdown,
	StyledSpinButton,
} from './DataSynthesisParameters.styles.js'
import type { DataSynthesisParametersProps } from './DataSynthesisParameters.types.js'

export const DataSynthesisParameters: React.FC<DataSynthesisParametersProps> =
	memo(function DataSynthesisParameter({
		enableRun,
		sensitiveCsvContent,
		onRun,
	}) {
		const theme = useTheme()
		const [rawSynthesisParams] = useRawSynthesisParameters()
		const [
			isAdvancedParametersOpen,
			{ setTrue: openAdvancedParameter, setFalse: dismissAdvancedParameter },
		] = useBoolean(false)

		const synthesisModeOptions = useSynthesisModeOptions()

		const handleSynthesisModeChange = useDropdownOnChange<SynthesisMode>(
			useRawSynthesisParametersPropertySetter('synthesisMode'),
		)
		const handleResolutionChange = useSpinButtonOnChange(
			useRawSynthesisParametersPropertySetter('resolution'),
		)
		const handleRecordLimitChange = useSpinButtonOnChange(
			useRawSynthesisParametersPropertySetter('recordLimit'),
		)
		const handleReportingLengthChange = useSpinButtonOnChange(
			useRawSynthesisParametersPropertySetter('reportingLength'),
		)
		const handleNoiseEpsilonChange = useSpinButtonOnChange(
			useRawSynthesisParametersPropertySetter('noiseEpsilon'),
		)

		const updateNoisyCountThreshold = useUpdateNoisyCountThreshold()

		const onRunClicked = () => onRun(rawSynthesisParams)

		useEffect(() => {
			updateNoisyCountThreshold(
				rawSynthesisParams.fabricationMode,
				rawSynthesisParams.reportingLength,
			)
		}, [
			rawSynthesisParams.fabricationMode,
			rawSynthesisParams.reportingLength,
			updateNoisyCountThreshold,
		])

		return (
			<FlexContainer gap={theme.spacing.s1} vertical wrap>
				<FlexContainer gap={theme.spacing.s1} wrap>
					<TooltipWrapper
						tooltip={tooltips.synthesisMode}
						label="Synthesis mode"
					>
						<StyledDropdown
							title="Synthesis mode"
							selectedKey={rawSynthesisParams.synthesisMode}
							onChange={handleSynthesisModeChange}
							placeholder="Select synthesis mode"
							options={synthesisModeOptions}
						/>
					</TooltipWrapper>
					<TooltipWrapper
						tooltip={tooltips.resolution}
						label="Privacy resolution"
					>
						<StyledSpinButton
							labelPosition={Position.top}
							min={1}
							step={1}
							value={rawSynthesisParams.resolution.toString()}
							onChange={handleResolutionChange}
						/>
					</TooltipWrapper>
					<TooltipWrapper
						tooltip={tooltips.reportingLength}
						label="Aggregation limit"
					>
						<StyledSpinButton
							labelPosition={Position.top}
							min={1}
							step={1}
							value={rawSynthesisParams.reportingLength.toString()}
							onChange={handleReportingLengthChange}
						/>
					</TooltipWrapper>
					<TooltipWrapper tooltip={tooltips.recordLimit} label="Record limit">
						<StyledSpinButton
							labelPosition={Position.top}
							min={1}
							max={sensitiveCsvContent.table.numRows()}
							step={10}
							value={rawSynthesisParams.recordLimit.toString()}
							onChange={handleRecordLimitChange}
						/>
					</TooltipWrapper>

					<FlexItem align="flex-end">
						<PrimaryButton
							type="submit"
							onClick={onRunClicked}
							disabled={!enableRun}
						>
							Run
						</PrimaryButton>
					</FlexItem>
					<FlexItem align="flex-end">
						<InfoTooltip title="Run Synthesizer">
							{tooltips.synthesize}
						</InfoTooltip>
					</FlexItem>
					<FlexItem align="flex-end">
						<IconButton
							iconProps={{
								iconName: 'settings',
							}}
							title={'Advanced parameters'}
							onClick={openAdvancedParameter}
						/>
					</FlexItem>
				</FlexContainer>

				<Panel
					isLightDismiss
					headerText="Advanced parameters"
					isOpen={isAdvancedParametersOpen}
					onDismiss={dismissAdvancedParameter}
					closeButtonAriaLabel="Close"
				>
					<DataSynthesisAdvancedParameters />
				</Panel>

				<FlexContainer gap={theme.spacing.s1} wrap>
					{rawSynthesisParams.synthesisMode === SynthesisMode.DP && (
						<>
							<TooltipWrapper tooltip={tooltips.noiseEpsilon} label="Epsilon">
								<StyledSpinButton
									labelPosition={Position.top}
									min={0}
									step={0.1}
									value={rawSynthesisParams.noiseEpsilon.toString()}
									onChange={handleNoiseEpsilonChange}
								/>
							</TooltipWrapper>
						</>
					)}
				</FlexContainer>
			</FlexContainer>
		)
	})
