import type { Metadata } from "next";
import "./globals.css";
import GlobalProvider from "./components/global-provider";

export const metadata: Metadata = {
  title: "OSS Recruitment",
};

//  const poppins = Poppins({
//    weight: ["400", "700"],
//    subsets: ["latin"],
//  });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=manrope:400,600,700"
          rel="stylesheet"
        />
      </head>
      <body>
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
