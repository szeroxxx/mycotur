import "@/styles/globals.css";
import "@/styles/map.css";
import "@/styles/calendar.css";
import "@/styles/transitions.css";
import "react-calendar/dist/Calendar.css";
import type { AppProps } from "next/app";
import Layout from "@/components/layout/Layout";
import { SessionProvider } from "next-auth/react";
import { Manrope } from 'next/font/google';
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { DataProvider } from "@/contexts/DataContext";

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const router = useRouter();

  return (
    <main className={`${manrope.variable} calendar-wrapper`}>
      <SessionProvider session={session}>
        <DataProvider>
          <Layout>
            <AnimatePresence mode="wait">
              <motion.div
                key={router.route}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Component {...pageProps} />
              </motion.div>
            </AnimatePresence>
          </Layout>
        </DataProvider>
      </SessionProvider>
    </main>
  );
}
