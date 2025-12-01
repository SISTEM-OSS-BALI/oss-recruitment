import { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faLocationDot,
  faFileContract,
  faClipboardCheck,
  faUserGroup,
  faCalendarCheck,
  faTable,
  faClipboardList,
  faCircleQuestion,
  faBookOpen,
  faFileLines,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import menuLabel from "@/app/utils/label";

export const SidebarMenuSettingAdmin = (): MenuProps["items"] => {
  const router = useRouter();

  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/admin/dashboard/user-management",
      label: menuLabel("User Management"),
      icon: <FontAwesomeIcon icon={faUserGroup} />,
      onClick: () => router.push("/admin/dashboard/user-management"),
    },
    {
      key: "/admin/dashboard/setting-job",
      label: menuLabel("Setting Job"),
      icon: <FontAwesomeIcon icon={faBriefcase} />,
      onClick: () => router.push("/admin/dashboard/setting-job"),
    },
    {
      key: "/admin/dashboard/template",
      label: menuLabel("Template"),
      icon: <FontAwesomeIcon icon={faBookOpen} />,
      children: [
        {
          key: "/admin/dashboard/template/contract-template",
          label: menuLabel("Contract Template"),
          icon: <FontAwesomeIcon icon={faFileContract} />,
          onClick: () =>
            router.push("/admin/dashboard/template/contract-template"),
        },
        {
          key: "/admin/dashboard/template/referral-card-template",
          label: menuLabel("Card Referral Template"),
          icon: <FontAwesomeIcon icon={faClipboardList} />,
          onClick: () =>
            router.push("/admin/dashboard/template/referral-card-template"),
        },
        {
          key: "/admin/dashboard/template/team-member-card-template",
          label: menuLabel("Team Member Card Template"),
          icon: <FontAwesomeIcon icon={faClipboardList} />,
          onClick: () =>
            router.push("/admin/dashboard/template/team-member-card-template"),
        },
        {
          key: "/admin/dashboard/template/employee-setup-template",
          label: menuLabel("Employee Setup Template"),
          icon: <FontAwesomeIcon icon={faClipboardList} />,
          onClick: () =>
            router.push("/admin/dashboard/template/employee-setup-template"),
        },
      ],
    },
    {
      key: "/admin/dashboard/evaluator",
      label: menuLabel("Evaluation"),
      icon: <FontAwesomeIcon icon={faClipboardCheck} />,
      children: [
        {
          key: "/admin/dashboard/evaluator/list",
          label: menuLabel("Evaluator List"),
          icon: <FontAwesomeIcon icon={faUserGroup} />,
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
          icon: <FontAwesomeIcon icon={faTable} />,
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
    {
      key: "/admin/dashboard/guidebook",
      label: menuLabel("Guidebook"),
      icon: <FontAwesomeIcon icon={faBookOpen} />,
      onClick: () => router.push("/admin/dashboard/guidebook"),
    },
    {
      key: "/admin/dashboard/procedure-document",
      label: menuLabel("Procedure Document"),
      icon: <FontAwesomeIcon icon={faFileLines} />,
      onClick: () => router.push("/admin/dashboard/procedure-document"),
    },
    // {
    //   key: "/admin/dashboard/consultant",
    //   label: menuLabel("Consultant"),
    //   icon: <FontAwesomeIcon icon={faUserTie} />,
    //   onClick: () => router.push("/admin/dashboard/consultant"),
    // },
    {
      key: "/admin/dashboard/company-setting",
      label: menuLabel("Company Setting"),
      icon: <FontAwesomeIcon icon={faGear} />,
      children: [
        {
          key: "/admin/dashboard/company-setting/profile",
          label: menuLabel("Company Profile"),
          icon: <FontAwesomeIcon icon={faBriefcase} />,
          onClick: () =>
            router.push("/admin/dashboard/company-setting/profile"),
        },
        {
          key: "/admin/dashboard/company-setting/location",
          label: menuLabel("Location"),
          icon: <FontAwesomeIcon icon={faLocationDot} />,
          onClick: () =>
            router.push("/admin/dashboard/company-setting/location"),
        },
      ],
    },
  ];

  return sidebarMenu;
};
