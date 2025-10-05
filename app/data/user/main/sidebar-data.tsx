import { DatabaseFilled } from "@ant-design/icons";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";

export const SidebarMainUser = (): MenuProps["items"] => {
  const router = useRouter();
  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/user/home/apply-job",
      label: "Apply Job",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/user/home/apply-job");
      },
    },
    {
      key: "/user/home/chat",
      label: "Chat",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/user/home/chat");
      },
    },
  ];

  return sidebarMenu;
};
