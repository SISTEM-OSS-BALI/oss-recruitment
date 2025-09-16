import { DatabaseFilled } from "@ant-design/icons";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";

export const SidebarMenuSettingAdmin = (): MenuProps["items"] => {
  const router = useRouter();
  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/admin/dashboard/location",
      label: "Location",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/admin/dashboard/location");
      },
    },
    {
      key: "/admin/dashboard/contract-template",
      label: "Contract Template",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/admin/dashboard/contract-template");
      },
    },
    {
      key: "/admin/dashboard/question-setting",
      label: "Question Setting",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/admin/dashboard/question-setting");
      },
    },
    {
      key: "/admin/dashboard/evaluator",
      label: "Evaluator",
      icon: <DatabaseFilled />,
      onClick: () => {
        router.push("/admin/dashboard/evaluator");
      },
    },
  ];

  return sidebarMenu;
};
