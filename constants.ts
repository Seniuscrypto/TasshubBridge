import { sepolia, bscTestnet, solanaDevnet, solana, bsc, mainnet, base, arbitrum, polygon } from "@reown/appkit/networks"

export const TOKENS = {
    // [sepolia.id]: "0x966D12C6cA09341cE49E9C04C103711fa63013B4",
    // [bscTestnet.id]: "0x2Fa3a87636869F99B5Af77CA0e6FD891C3c9C893",
    [bsc.id]: "0x6612c68a32Ce2b5F38f0729A4f0F0521DEE84675",
    [base.id]: "0x6612c68a32Ce2b5F38f0729A4f0F0521DEE84675",
    [mainnet.id]: "0xb6A3Ad997d597E30eaB9aEadE4fB5Ec8Be44919c",
    [arbitrum.id]: "0x6612c68a32Ce2b5F38f0729A4f0F0521DEE84675",
    [polygon.id]: "0x6612c68a32Ce2b5F38f0729A4f0F0521DEE84675"
    
}
export const ENDPOINTS = {
    // [sepolia.id]: "40161",
    // [bscTestnet.id]: "40102",
    // [solanaDevnet.id]: "40168",
    [solana.id]: "30168",
    [mainnet.id]: "30101",
    [bsc.id]: "30102",
    [base.id]: "30184",
    [arbitrum.id]: "30110",
    [polygon.id]: "30109"
}

export const ChainUrls = {
    [solana.id]: "image/sol.png",
    [mainnet.id]: "image/eth.png",
}