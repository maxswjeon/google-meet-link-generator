import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";

import "styles/globals.css";

const PRETENDARD_FONT =
  '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;';

const theme = extendTheme({
  fonts: {
    heading: PRETENDARD_FONT,
    body: PRETENDARD_FONT,
  },
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}
