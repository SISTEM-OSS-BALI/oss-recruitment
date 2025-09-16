import { ApplicantDataModel } from "@/app/models/apply-job";
import { formatDate } from "@/app/utils/date-helper";
import { HistoryOutlined, UserOutlined } from "@ant-design/icons";
import { Button } from "antd";

export default function Columns({
  onDetail,
  onHistory,
}: {
  onDetail: (id: string) => void;
  onHistory: (id: string) => void;
}) {
  const columnDefinitions = [
    {
      title: "No",
      dataIndex: "no",
      width: 60,
      align: "center" as const,
      render: (_: string, __: ApplicantDataModel, idx: number) => idx + 1,
    },
    { title: "Candidate Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone Number", dataIndex: "phone" },
    {
      title: "Status",
      key: "stage",
      dataIndex: "stage",
      render: (value: string, record: ApplicantDataModel) => (
        <StatusTag stage={record.user?.stage} />
      ),
    },
    {
      title: "Apply For",
      dataIndex: "job",
      render: (value: string, record: ApplicantDataModel) => (
        <span>{record.job?.name ?? "-"}</span>
      ),
    },
    {
      title: "Last Updated At",
      dataIndex: "updatedAt",
      render: (value: string) => formatDate(value),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_: string, record: CandidateDataModel) => (
        <ActionButtons id={record.id} openDetail={onDetail} onHistory={onHistory} />
      ),
    },
  ];

  return columnDefinitions;
}

const StatusTag = ({ stage }: { stage: string | undefined }) => {
  const trimmedStage = stage?.trim() || "Waiting";
  return (
    <span
      style={{
        backgroundColor: "#1E1E1E",
        color: "#fff",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        display: "inline-block",
        fontWeight: 500,
      }}
    >
      {trimmedStage}
    </span>
  );
};

const ActionButtons = ({
  id,
  openDetail,
  onHistory,
}: {
  id: string;
  openDetail: (id: string) => void;
  onHistory: (id: string) => void;
}) => {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <Button
        type="primary"
        shape="circle"
        icon={<UserOutlined />}
        onClick={() => openDetail(id)}
      />
      <Button
        type="default"
        shape="circle"
        icon={<HistoryOutlined />}
        onClick={() => onHistory(id)}
      />
    </div>
  );
};
