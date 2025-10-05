import {
  EnvironmentOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  UserSwitchOutlined,
  CalendarOutlined,
  SettingOutlined,
  ExperimentOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { MenuProps } from "antd";
import { useRouter } from "next/navigation";

export const SidebarMenuSettingAdmin = (): MenuProps["items"] => {
  const router = useRouter();

  const sidebarMenu: MenuProps["items"] = [
    {
      key: "/admin/dashboard/location",
      label: "Location",
      icon: <EnvironmentOutlined />,
      onClick: () => router.push("/admin/dashboard/location"),
    },
    {
      key: "/admin/dashboard/contract-template",
      label: "Contract Template",
      icon: <FileTextOutlined />,
      onClick: () => router.push("/admin/dashboard/contract-template"),
    },
    {
      key: "/admin/dashboard/evaluator",
      label: "Evaluator",
      icon: <UserSwitchOutlined />,
      // onClick: () => router.push("/admin/dashboard/evaluator"),
      children: [
        {
          key: "/admin/dashboard/evaluator/list",
          label: "Evaluator List",
          icon: <UserSwitchOutlined />,
          onClick: () => router.push("/admin/dashboard/evaluator/list"),
        },
        {
          key: "/admin/dashboard/evaluator/schedule",
          label: "Schedule Evaluator",
          icon: <CalendarOutlined />,
          onClick: () => router.push("/admin/dashboard/evaluator/schedule"),
        },
        {
          key: "/admin/dashboard/evaluator/question-setting",
          label: "Question Setting",
          icon: <QuestionCircleOutlined />,
          onClick: () =>
            router.push("/admin/dashboard/evaluator/question-setting"),
        },
      ],
    },
    {
      key: "/admin/dashboard/assignment-setting",
      label: "Assignment Setting",
      icon: <SettingOutlined />,
      children: [
        {
          key: "/admin/dashboard/assignment-setting/mbti",
          label: "MBTI",
          icon: <ExperimentOutlined />,
          onClick: () =>
            router.push("/admin/dashboard/assignment-setting/mbti"),
        },
        {
          key: "/admin/dashboard/assignment-setting/task",
          label: "Task",
          icon: <CheckSquareOutlined />,
          onClick: () =>
            router.push("/admin/dashboard/assignment-setting/task"),
        },
      ],
    },
  ];

  return sidebarMenu;
};
