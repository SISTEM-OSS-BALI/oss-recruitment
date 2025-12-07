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

type MenuItems = NonNullable<MenuProps["items"]>;

export type AdminRole = "ADMIN" | "SUPER_ADMIN" | "CANDIDATE";

const restrictedRoutes: Record<string, AdminRole[]> = {
  "/admin/dashboard/user-management": ["SUPER_ADMIN"],
  "/admin/dashboard/template": ["SUPER_ADMIN"],
  "/admin/dashboard/evaluation": ["SUPER_ADMIN"],
  "/admin/dashboard/evaluator": ["SUPER_ADMIN"],
  "/admin/dashboard/assignment-setting": ["SUPER_ADMIN"],
  "/admin/dashboard/procedure-document": ["SUPER_ADMIN"],
};

const filterMenuItems = (
  items: MenuProps["items"],
  role?: AdminRole
): MenuProps["items"] => {
  if (!role || role === "SUPER_ADMIN") return items;

  return (
    items
      ?.map((item) => {
        if (!item) return null;

        const key = typeof item.key === "string" ? item.key : undefined;
        if (key) {
          const allowedRoles = restrictedRoutes[key];
          if (allowedRoles && !allowedRoles.includes(role)) {
            return null;
          }
        }

        if ("children" in item && item.children && item.children.length > 0) {
          const filteredChildren = filterMenuItems(
            item.children as MenuProps["items"],
            role
          );

          if (!filteredChildren?.length) {
            return null;
          }

          return {
            ...item,
            children: filteredChildren,
          };
        }

        return item;
      })
      .filter((item): item is MenuItems[number] => !!item) ?? []
  );
};

export const SidebarMenuSettingAdmin = (
  role?: AdminRole
): MenuProps["items"] => {
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

  return filterMenuItems(sidebarMenu, role);
};
