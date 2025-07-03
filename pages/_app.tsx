import '../styles/globals.css';
import '../styles/fly-heart.css';
import '../styles/theme-cyberpunk.css';
import '../styles/theme-retro-terminal.css';
import type { AppProps } from 'next/app';
import { LivepeerConfig, createReactClient, studioProvider } from '@livepeer/react';

const livepeerClient = createReactClient({
  provider: studioProvider({ apiKey: process.env.NEXT_PUBLIC_LIVEPEER_API_KEY || '' }),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LivepeerConfig client={livepeerClient}>
      <Component {...pageProps} />
    </LivepeerConfig>
  );
}

export default MyApp;
