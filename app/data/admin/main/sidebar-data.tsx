import { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie, 
  faChartLine, 
  faCalendarCheck, 
} from "@fortawesome/free-solid-svg-icons";

export const SidebarMenuMainAdmin = (): MenuProps["items"] => {
  const router = useRouter();

  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/admin/dashboard/recruitment",
      label: "Recruitment",
      icon: <FontAwesomeIcon icon={faUserTie} />,
      onClick: () => router.push("/admin/dashboard/recruitment"),
    },
    {
      key: "/admin/dashboard/management-contract",
      label: "Management Contract",
      icon: <FontAwesomeIcon icon={faChartLine} />,
      onClick: () => router.push("/admin/dashboard/management-contract"),
    },
    {
      key: "/admin/dashboard/schedule-interview",
      label: "Schedule Interview",
      icon: <FontAwesomeIcon icon={faCalendarCheck} />,
      onClick: () => router.push("/admin/dashboard/schedule-interview"),
    },
  ];

  return sidebarMenu;
};
