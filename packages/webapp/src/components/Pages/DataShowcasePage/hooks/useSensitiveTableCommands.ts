/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { ICommandBarItemProps } from '@fluentui/react'
import { useMemo } from 'react'
import { SetterOrUpdater } from 'recoil'
import {
	useDownloadCommand,
	useSensitiveZerosCommand,
	useVisibleColumnsCommand,
} from './commands'
import { ICsvContent } from '~models'

export function useSensitiveTableCommands(
	content: ICsvContent,
	setSensitiveContent: SetterOrUpdater<ICsvContent>,
): ICommandBarItemProps[] {
	const dlcmd = useDownloadCommand(content, 'sensitive_data.csv')
	const vccmd = useVisibleColumnsCommand(content, setSensitiveContent)
	const cicmd = useSensitiveZerosCommand(content, setSensitiveContent)
	return useMemo(() => [dlcmd, vccmd, cicmd], [dlcmd, vccmd, cicmd])
}
