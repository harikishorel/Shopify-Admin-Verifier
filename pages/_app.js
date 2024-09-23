import { SessionProvider } from "next-auth/react";
import "@/styles/globals.css";
import NextProgress from "nextjs-progressbar";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <NextProgress
        // color="#F8B940"
        startPosition={0.3}
        stopDelayMs={200}
        height={3}
      />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
