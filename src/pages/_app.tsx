import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/layout/Layout";
import { SessionProvider } from "next-auth/react";
import { Manrope } from 'next/font/google';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <main className={`${manrope.variable}`}>
      <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </main>
  );
}
