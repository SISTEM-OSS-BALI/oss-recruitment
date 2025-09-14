import { useJob, useJobs } from "@/app/hooks/job";
import { JobDataModel } from "@/app/models/job";
import { Flex, Form, Table } from "antd";
import { useState } from "react";
import { JobColumns } from "./columns";
import Title from "antd/es/typography/Title";
import SearchBar from "@/app/components/common/search-bar";
import CustomButton from "@/app/components/common/custom-buttom";
import { PlusOutlined } from "@ant-design/icons";
import JobModal from "@/app/components/common/modal/admin/job";

export default function SettingJobContent() {
  const [form] = Form.useForm<JobDataModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [selectedJob, setSelectedJob] = useState<JobDataModel | null>(null);

  const {
    data: jobsData,
    onCreate: jobCreate,
    onCreateLoading: jobLoadingCreate,
    onDelete: onDeleteJob,
  } = useJobs({});

  const { onUpdate: jobUpdate, onUpdateLoading: jobLoadingUpdate } = useJob({
    id: selectedJob?.id || "",
  });

  const handleEdit = (id: string) => {
    const jobEdit = jobsData?.find((job) => job.id === id);
    if (jobEdit) {
      setSelectedJob(jobEdit);
      setModalType("update");
      setModalOpen(true);
    }
  };

  const columns = JobColumns({
    onDelete: (id) => onDeleteJob(id),
    onEdit: (id) => handleEdit(id),
  });

  const handleFinish = async (values: JobDataModel) => {
    if (modalType === "create") {
      await jobCreate(values);
    } else if (selectedJob?.id) {
      await jobUpdate({ id: selectedJob.id, payload: values });
    }
    form.resetFields();
    setSelectedJob(null);
    setModalOpen(false);
    setModalType("create");
  };
  return (
    <div>
      <div>
        <Title level={4}>Job Management</Title>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Flex justify="space-between">
          <SearchBar onSearch={() => {}} />
          <CustomButton
            title="Add Job"
            onClick={() => {
              form.resetFields();
              setSelectedJob(null);
              setModalType("create");
              setModalOpen(true);
            }}
            icon={<PlusOutlined />}
          />
        </Flex>
      </div>
      <div>
        <Table columns={columns} dataSource={jobsData} rowKey={"id"} />
      </div>
      <div>
        <JobModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            form.resetFields();
            setSelectedJob(null);
            setModalType("create");
          }}
          form={form}
          type={modalType}
          initialValues={
            modalType === "update" ? selectedJob ?? undefined : undefined
          }
          handleFinish={handleFinish}
          loadingCreate={jobLoadingCreate}
          loadingUpdate={jobLoadingUpdate}
        />
      </div>
    </div>
  );
}
