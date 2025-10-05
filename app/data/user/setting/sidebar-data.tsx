import { DatabaseFilled } from "@ant-design/icons";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";

export const SidebarSettingUser = (): MenuProps["items"] => {
  const router = useRouter();
  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/user/home/profile",
      label: "Profile",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/user/home/profile");
      },
    },
  ];

  return sidebarMenu;
};
