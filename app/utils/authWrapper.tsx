"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const authRoutes = ["/login", "/"];
  const shouldProtect = !authRoutes.some((route) => {
    const regex = new RegExp(`^${route}(/.*)?$`);
    return regex.test(pathname);
  });

  useEffect(() => {
    if (status === "loading") return;

    if (shouldProtect && !session) {
      router.push("/login");
    }
  }, [session, status, router, shouldProtect]);

  return <>{children}</>;
}
