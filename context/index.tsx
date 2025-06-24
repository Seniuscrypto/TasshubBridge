'use client'

import { wagmiAdapter, projectId, networks } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { mainnet, arbitrum, sepolia, bscTestnet, solanaDevnet, solana, avalanche, polygon, base, bsc } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';



// 0. Set up Solana Adapter
const solanaWeb3JsAdapter = new SolanaAdapter()
// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
    name: 'appkit-example',
    description: 'AppKit Example',
    url: 'https://appkitexampleapp.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
const modal = createAppKit({
    adapters: [wagmiAdapter, solanaWeb3JsAdapter],
    projectId,
    networks: networks,
    defaultNetwork: solana,
    metadata: metadata,
    features: {
        analytics: true // Optional - defaults to your Cloud configuration
    },
    // themeMode: 'light', // Optional - defaults to 'light'
    // themeVariables: {
    //     '--appkit-primary-color': '#4F46E5', // Optional - defaults to '#4F46E5'
    //     '--appkit-secondary-color': '#A78BFA' // Optional - defaults to '#A78BFA'
    // }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider