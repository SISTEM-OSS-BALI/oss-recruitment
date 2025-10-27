import { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faLocationDot,
  faFileContract,
  faUserCheck,
  faUsers,
  faCalendarCheck,
  faTableList,
  faClipboardList,
  faSquareCheck,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import menuLabel from "@/app/utils/label";

export const SidebarMenuSettingAdmin = (): MenuProps["items"] => {
  const router = useRouter();

  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/admin/dashboard/setting-job",
      label: menuLabel("Setting Job"),
      icon: <FontAwesomeIcon icon={faBriefcase} />,
      onClick: () => router.push("/admin/dashboard/setting-job"),
    },
    {
      key: "/admin/dashboard/location",
      label: menuLabel("Location"),
      icon: <FontAwesomeIcon icon={faLocationDot} />,
      onClick: () => router.push("/admin/dashboard/location"),
    },
    {
      key: "/admin/dashboard/contract-template",
      label: menuLabel("Contract Template"),
      icon: <FontAwesomeIcon icon={faFileContract} />,
      onClick: () => router.push("/admin/dashboard/contract-template"),
    },
    {
      key: "/admin/dashboard/evaluator",
      label: menuLabel("Evaluation"),
      icon: <FontAwesomeIcon icon={faUserCheck} />,
      children: [
        {
          key: "/admin/dashboard/evaluator/list",
          label: menuLabel("Evaluator List"),
          icon: <FontAwesomeIcon icon={faUsers} />,
          onClick: () => router.push("/admin/dashboard/evaluator/list"),
        },
        {
          key: "/admin/dashboard/evaluator/schedule",
          label: menuLabel("Schedule Evaluator"),
          icon: <FontAwesomeIcon icon={faCalendarCheck} />,
          onClick: () => router.push("/admin/dashboard/evaluator/schedule"),
        },
        {
          key: "/admin/dashboard/evaluator/matriks-question",
          label: menuLabel("Matriks Question"),
          icon: <FontAwesomeIcon icon={faTableList} />,
          onClick: () =>
            router.push("/admin/dashboard/evaluator/matriks-question"),
        },
      ],
    },
    {
      key: "/admin/dashboard/assignment-setting",
      label: menuLabel("Assignment Setting"),
      icon: <FontAwesomeIcon icon={faClipboardList} />,
      children: [
        {
          key: "/admin/dashboard/assignment-setting/task",
          label: menuLabel("Task"),
          icon: <FontAwesomeIcon icon={faSquareCheck} />,
          onClick: () =>
            router.push("/admin/dashboard/assignment-setting/task"),
        },
        {
          key: "/admin/dashboard/assignment-setting/screening-question",
          label: menuLabel("Screening Question"),
          icon: <FontAwesomeIcon icon={faCircleQuestion} />,
          onClick: () =>
            router.push(
              "/admin/dashboard/assignment-setting/screening-question"
            ),
        },
      ],
    },
  ];

  return sidebarMenu;
};
