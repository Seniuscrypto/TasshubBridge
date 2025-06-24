import { mainnet, sepolia, arbitrum, bsc, bscTestnet, polygon, base, avalanche } from "wagmi/chains";
import { createConfig, http } from "wagmi";

export const config = createConfig({
    chains: [ mainnet, arbitrum, bsc, polygon, base, avalanche ],
    transports: {
        [mainnet.id]: http(),
        [arbitrum.id]: http(),
        [bsc.id]: http(),
        [polygon.id]: http(),
        [base.id]: http(),
        [avalanche.id]: http(),        
    }
})