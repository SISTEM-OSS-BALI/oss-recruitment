import { CalendarOutlined, DatabaseFilled } from "@ant-design/icons";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";

export const SidebarMenuMainAdmin = (): MenuProps["items"] => {
  const router = useRouter();
  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/admin/dashboard/recruitment",
      label: "Recruitment",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/admin/dashboard/recruitment");
      },
    },
    {
      key: "/admin/dashboard/setting-job",
      label: "Setting Job",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/admin/dashboard/setting-job");
      },
    },
    {
      key: "/admin/dashboard/appressal",
      label: "Appressal",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/admin/dashboard/appressal");
      },
    },
    {
      key: "/admin/dashboard/schedule-interview",
      label: "Schedule Interview",
      icon: <CalendarOutlined />,
      onClick: () => {
        router.push("/admin/dashboard/schedule-interview");
      },
    },
  ];

  return sidebarMenu;
};
