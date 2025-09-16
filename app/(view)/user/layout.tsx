"use client";

import UserLayout from "@/app/components/container/user/layout";
import { useAuth } from "@/app/utils/useAuth";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user_name } = useAuth();
  return <UserLayout username={user_name!}>{children}</UserLayout>;
}
