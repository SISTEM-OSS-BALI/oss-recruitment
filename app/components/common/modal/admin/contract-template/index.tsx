import { Modal } from "antd";

import { FormInstance } from "antd";
import { ContractTemplateDataModel } from "@/app/models/contract-template";
import ContractTemplateForm from "../../../form/admin/contract-template";

export default function ContractTemplateModal({
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
  handleFinish: (values: ContractTemplateDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<ContractTemplateDataModel>;
  type: "create" | "update";
  initialValues?: ContractTemplateDataModel;
}) {
  return (
    <Modal
      open={open}
      title={
        type === "create" ? "Add Contract Template" : "Edit Contract Template"
      }
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      <ContractTemplateForm
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
