import '../styles/globals.css';
import '../styles/fly-heart.css';
import '../styles/theme-cyberpunk.css';
import '../styles/theme-retro-terminal.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
