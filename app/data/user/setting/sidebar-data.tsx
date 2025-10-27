"use client";

import menuLabel from "@/app/utils/label";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";
// Font Awesome (React)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export const SidebarSettingUser = (): MenuProps["items"] => {
  const router = useRouter();

  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/user/home/profile",
      label: menuLabel("Profile"), // atau "Profil" jika mau full Bahasa
      icon: <FontAwesomeIcon icon={faUser} style={{ fontSize: 16 }} />,
      onClick: () => router.push("/user/home/profile"),
    },
  ];

  return sidebarMenu;
};
