/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { CSSProperties, ElementType, PropsWithChildren } from 'react'

export type FlexItemProps = PropsWithChildren<{
	as?: ElementType
	order?: number
	shrink?: number
	basis?: string
	grow?: number
	align?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
	className?: string
	style?: CSSProperties
}>
