import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider,createConfig } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import {
  base,
  baseSepolia,
  mainnet,
  sepolia
} from 'wagmi/chains';
// import { walletConnect } from 'wagmi/connectors'
import { getDefaultConfig, getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';


const {connectors} = getDefaultWallets({
  appName:'RainbowKit App',
  projectId: 'fd7a92a9a733b49d0dce1c6fb4887e40',
  // chains
})

const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: 'fd7a92a9a733b49d0dce1c6fb4887e40',
  chains: [
    base,

    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],  
  ssr: true,
});
// const connectors = connectorsForWallets([
//   {
//     groupName: 'WalletConnect',
//     wallets: [coinbaseWallet]
//   }
//   ],
//   {
//     appName:'RainbowKit App',
//     projectId: 'fd7a92a9a733b49d0dce1c6fb4887e40'
//   }

// )

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
