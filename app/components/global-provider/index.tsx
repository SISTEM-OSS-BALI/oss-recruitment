"use client";

import antdTheme from "@/app/config/antdTheme";
import AuthWrapper from "@/app/utils/authWrapper";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { SessionProvider } from "next-auth/react";
import "react-quill/dist/quill.snow.css";

export default function GlobalProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  return (
    <SessionProvider>
      <AntdRegistry>
        <ConfigProvider theme={antdTheme}>
          <QueryClientProvider client={queryClient}>
            <AuthWrapper>{children}</AuthWrapper>
          </QueryClientProvider>
        </ConfigProvider>
      </AntdRegistry>
    </SessionProvider>
  );
}
