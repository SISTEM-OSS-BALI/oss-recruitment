import { Tabs, TabsProps } from "antd";
import PersonalInformationDocuments from "./PersonalInformationComponent";
import DocumentsComponent from "./DocumentComponent";
import PreviewComponent from "./PreviewComponent";

export default function TabLayout() {
  const tabItems: TabsProps["items"] = [
    {
      key: "1",
      label: "Preview",
      children: <PreviewComponent />,
    },
    {
      key: "2",
      label: "Personal Information",
      children: <PersonalInformationDocuments />,
    },
    {
      key: "3",
      label: "Documents",
      children: <DocumentsComponent />,
    },
  ];

  return (
    <div>
      <Tabs defaultActiveKey="1" items={tabItems} />
    </div>
  );
}
