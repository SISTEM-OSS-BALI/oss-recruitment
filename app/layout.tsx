import type { Metadata } from "next";
import "./globals.css";
import GlobalProvider from "./components/global-provider";
import { Poppins } from "next/font/google";

export const metadata: Metadata = {
  title: "OSS Recruitment",
};

 const poppins = Poppins({
   weight: ["400", "700"],
   subsets: ["latin"],
 });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.className}>
      <body>
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
