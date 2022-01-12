/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { downloadCommand } from '@data-wrangling-components/react'
import { ICommandBarItemProps } from '@fluentui/react'
import { useMemo } from 'react'
import { ICsvContent } from '~models'

export function useDownloadCommand(
	content: ICsvContent,
	filename: string,
): ICommandBarItemProps {
	return useMemo(() => downloadCommand(content.table, filename), [content, filename])
}
