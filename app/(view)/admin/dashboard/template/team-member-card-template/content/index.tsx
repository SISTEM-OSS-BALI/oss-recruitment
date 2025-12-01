"use client";

import { useTeamMemberCardTemplate, useTeamMemberCardTemplates } from "@/app/hooks/team-member-card-template";
import { TeamMemberCardTemplateDataModel } from "@/app/models/team-member-card-template";
import SearchBar from "@/app/components/common/search-bar";
import CustomButton from "@/app/components/common/custom-buttom";
import { Flex, Form, Table } from "antd";
import Title from "antd/es/typography/Title";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { TeamMemberCardTemplateColumns } from "./columns";
import TeamMemberCardTemplateModal from "@/app/components/common/modal/admin/team-member-card-template";

export default function TeamMemberCardTemplateContent() {
  const [form] = Form.useForm<TeamMemberCardTemplateDataModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [selectedTemplate, setSelectedTemplate] =
    useState<TeamMemberCardTemplateDataModel | null>(null);

  const {
    data: templates,
    fetchLoading,
    onCreate,
    onCreateLoading,
    onDelete,
  } = useTeamMemberCardTemplates({});

  const { onUpdate, onUpdateLoading } = useTeamMemberCardTemplate({
    id: selectedTemplate?.id || "",
  });

  const handleEdit = (id: string) => {
    const template = templates?.find((item) => item.id === id);
    if (!template) return;
    setSelectedTemplate(template);
    setModalType("update");
    setModalOpen(true);
  };

  const columns = TeamMemberCardTemplateColumns({
    onDelete: (id) => onDelete(id),
    onEdit: (id) => handleEdit(id),
  });

  const resetModalState = () => {
    form.resetFields();
    setSelectedTemplate(null);
    setModalType("create");
    setModalOpen(false);
  };

  const handleFinish = async (values: TeamMemberCardTemplateDataModel) => {
    if (modalType === "create") {
      await onCreate(values);
    } else if (selectedTemplate?.id) {
      await onUpdate({
        id: selectedTemplate.id,
        payload: values,
      });
    }
    resetModalState();
  };

  return (
    <div>
      <div>
        <Title level={4}>Team Member Card Template Management</Title>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Flex justify="space-between">
          <SearchBar onSearch={() => {}} />
          <CustomButton
            title="Add Team Member Card Template"
            onClick={() => {
              form.resetFields();
              setSelectedTemplate(null);
              setModalType("create");
              setModalOpen(true);
            }}
            icon={<PlusOutlined />}
          />
        </Flex>
      </div>
      <div>
        <Table
          columns={columns}
          dataSource={templates}
          rowKey={"id"}
          loading={fetchLoading}
        />
      </div>
      <div>
        <TeamMemberCardTemplateModal
          open={modalOpen}
          onClose={resetModalState}
          initialValues={
            modalType === "update" ? selectedTemplate ?? undefined : undefined
          }
          form={form}
          type={modalType}
          handleFinish={handleFinish}
          loadingCreate={onCreateLoading}
          loadingUpdate={onUpdateLoading}
        />
      </div>
    </div>
  );
}
