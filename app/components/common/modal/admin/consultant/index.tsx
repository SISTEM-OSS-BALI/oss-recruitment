import { Modal } from "antd";
import { FormInstance } from "antd";
import { ConsultantDataModel } from "@/app/models/consultant";
import ConsultantForm from "../../../form/admin/consultant";

export default function ConsultantModal({
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
  handleFinish: (values: ConsultantDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<ConsultantDataModel>;
  type: "create" | "update";
  initialValues?: ConsultantDataModel;
}) {
  return (
    <Modal
      open={open}
      title={type === "create" ? "Add Job" : "Edit Job"}
      footer={null}
      onCancel={onClose}
      width={700}
    >
      <ConsultantForm
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
