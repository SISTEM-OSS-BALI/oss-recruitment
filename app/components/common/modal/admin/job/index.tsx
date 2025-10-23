import { JobDataModel } from "@/app/models/job";
import { Modal } from "antd";

import { FormInstance } from "antd";
import JobForm from "../../../form/admin/job";

export default function JobModal({
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
  handleFinish: (values: JobDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<JobDataModel>;
  type: "create" | "update";
  initialValues?: JobDataModel;
}) {
  return (
    <Modal
      open={open}
      title={type === "create" ? "Add Job" : "Edit Job"}
      footer={null}
      onCancel={onClose}
    >
      <JobForm
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
