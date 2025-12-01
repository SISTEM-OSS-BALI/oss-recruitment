"use client";

import { TeamMemberCardTemplateDataModel } from "@/app/models/team-member-card-template";
import { Modal, FormInstance } from "antd";
import TeamMemberCardTemplateForm from "../../../form/admin/team-member-card-template";

export default function TeamMemberCardTemplateModal({
  open,
  onClose,
  handleFinish,
  loadingCreate,
  loadingUpdate,
  form,
  type,
  initialValues,
}: {
  open: boolean;
  onClose: () => void;
  handleFinish: (values: TeamMemberCardTemplateDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<TeamMemberCardTemplateDataModel>;
  type: "create" | "update";
  initialValues?: TeamMemberCardTemplateDataModel;
}) {
  return (
    <Modal
      open={open}
      title={
        type === "create"
          ? "Add Team Member Card Template"
          : "Edit Team Member Card Template"
      }
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      <TeamMemberCardTemplateForm
        open={open}
        onFinish={handleFinish}
        loadingCreate={loadingCreate}
        loadingUpdate={loadingUpdate}
        form={form}
        type={type}
        initialValues={initialValues}
      />
    </Modal>
  );
}
