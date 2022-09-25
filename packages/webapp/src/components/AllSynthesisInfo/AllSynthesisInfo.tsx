/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { DetailsList, SelectionMode } from '@fluentui/react'
import { FlexContainer, FlexItem } from '@sds/components'
import { memo, useEffect } from 'react'

import {
	useSynthesisInfoColumns,
	useSynthesisInfoSelection,
} from './AllSynthesisInfo.hooks.js'
import { Container } from './AllSynthesisInfo.styles.js'
import type { AllSynthesisInfoProps } from './AllSynthesisInfo.types.js'

export const AllSynthesisInfo: React.FC<AllSynthesisInfoProps> = memo(
	function AllSynthesisInfo({
		allSynthesisInfo,
		selectedSynthesisInfo,
		onSelected,
		onDelete,
	}) {
		const columns = useSynthesisInfoColumns(onDelete)
		const selection = useSynthesisInfoSelection(onSelected)

		useEffect(() => {
			if (selectedSynthesisInfo) {
				selection.setItems(allSynthesisInfo)
				selection.setKeySelected(selectedSynthesisInfo.key, true, true)
			}
		}, [selection, allSynthesisInfo, selectedSynthesisInfo])

		return (
			<Container>
				<FlexContainer vertical>
					<FlexItem grow={1}>
						<DetailsList
							items={allSynthesisInfo}
							columns={columns}
							compact
							setKey={selectedSynthesisInfo?.key}
							selection={selection}
							selectionMode={SelectionMode.single}
						/>
					</FlexItem>
				</FlexContainer>
			</Container>
		)
	},
)
