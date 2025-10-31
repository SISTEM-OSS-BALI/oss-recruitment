import menuLabel from "@/app/utils/label";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";
// Font Awesome (React)
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase } from "@fortawesome/free-solid-svg-icons";

export const SidebarMainUser = (): MenuProps["items"] => {
  const router = useRouter();

  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/user/home/apply-job",
      label: menuLabel("Apply Job"),
      icon: <FontAwesomeIcon icon={faBriefcase} style={{ fontSize: 16 }} />,
      onClick: () => router.push("/user/home/apply-job"),
    },
  ];

  return sidebarMenu;
};
