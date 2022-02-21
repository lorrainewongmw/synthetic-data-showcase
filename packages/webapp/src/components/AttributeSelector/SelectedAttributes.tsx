/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	CommandButton,
	IIconProps,
	IStackTokens,
	PrimaryButton,
	Stack,
	useTheme,
} from '@fluentui/react'
import { memo } from 'react'
import { HeaderNames, ISelectedAttributesByColumn } from 'sds-wasm'
import { useSelectedAttributesByColumnEntries } from './hooks'
import {
	ClearSelectedAttributesCallback,
	SetSelectedAttributesCallback,
} from '~components/Pages/DataShowcasePage/DataNavigation'

const deleteIcon: IIconProps = { iconName: 'Delete' }

export interface SelectedAttributesProps {
	headers: HeaderNames
	selectedAttributesByColumn: ISelectedAttributesByColumn
	onSetSelectedAttributes: SetSelectedAttributesCallback
	onClearSelectedAttributes: ClearSelectedAttributesCallback
}

export const SelectedAttributes: React.FC<SelectedAttributesProps> = memo(
	function SelectedAttributes({
		headers,
		selectedAttributesByColumn,
		onSetSelectedAttributes,
		onClearSelectedAttributes,
	}: SelectedAttributesProps) {
		const theme = useTheme()
		const selectedEntries = useSelectedAttributesByColumnEntries(
			selectedAttributesByColumn,
		)

		const stackTokens: IStackTokens = {
			childrenGap: theme.spacing.s2,
		}

		return (
			<Stack tokens={stackTokens} horizontal wrap verticalAlign="center">
				<PrimaryButton
					onClick={onClearSelectedAttributes}
					disabled={selectedEntries.length === 0}
				>
					Clear
				</PrimaryButton>
				{selectedEntries.flatMap(entry => {
					return Array.from(entry[1].keys())
						.sort()
						.map(value => {
							return (
								<CommandButton
									key={`${entry[0]}:${value}`}
									iconProps={deleteIcon}
									text={`${headers[entry[0]]}:${value}`}
									onClick={async () =>
										await onSetSelectedAttributes(+entry[0], undefined)
									}
								/>
							)
						})
				})}
			</Stack>
		)
	},
)
