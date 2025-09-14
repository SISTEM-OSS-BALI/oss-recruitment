"use client";

import UserLayout from "@/app/components/container/user/layout";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <UserLayout>{children}</UserLayout>;
}
