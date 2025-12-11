import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SolanaWalletProvider } from './components/SolanaWalletProvider.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SolanaWalletProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </SolanaWalletProvider>
  </StrictMode>,
)
