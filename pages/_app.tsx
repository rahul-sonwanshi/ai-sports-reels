import type { AppProps } from "next/app";
import "../styles/globals.css"; // Import your global CSS here

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
