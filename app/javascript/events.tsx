import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { App } from './events/App';
import theme from './theme';

import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

document.addEventListener('DOMContentLoaded', () => {
  const rootEl = document.getElementById('app')
  ReactDOM.render((
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  ), rootEl)
})
