/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { loadFluentTheme, ThematicFluentProvider } from '@thematic/fluent'
import { ApplicationStyles, useThematic } from '@thematic/react'
import type { PropsWithChildren } from 'react'
import React, { memo, useMemo } from 'react'
import {
	createGlobalStyle,
	ThemeProvider as StyledProviderRaw,
} from 'styled-components'

const StyledProvider = StyledProviderRaw as any

export const StyleContext: React.FC<
	PropsWithChildren<{
		/* nothing */
	}>
> = memo(function StyleContext({ children }) {
	const theme = useThematic()
	const fluentTheme = useMemo(() => loadFluentTheme(theme), [theme])
	return (
		<>
			{/* core thematic for charting colors and imperative use */}
			<ThematicFluentProvider theme={theme}>
				<GlobalStyle />
				<ApplicationStyles />
				{/* pass unified thematic/fluent theme to styled-components as well */}
				<StyledProvider theme={fluentTheme}>{children}</StyledProvider>
			</ThematicFluentProvider>
		</>
	)
})

const GlobalStyle = createGlobalStyle`
	html {
		box-sizing: border-box;
	}
	*, *:before, *:after {
		box-sizing: inherit;
	}

	body {
		height: 100vh;
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
			'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
			sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	#root, #root > div:first-child {
		height: 100%;
	}

	code {
		font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
			monospace;
	}
` as any
