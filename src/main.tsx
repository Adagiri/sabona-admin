import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@mui/material/styles";
import './index.css'
import App from './App.tsx'
import theme from './theme.ts';
import { QueryClientProvider } from '@tanstack/react-query';
import { RNQueryClient } from './services/react-query/index.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={RNQueryClient}>
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
