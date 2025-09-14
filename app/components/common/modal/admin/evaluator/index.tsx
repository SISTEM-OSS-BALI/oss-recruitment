import { Modal } from "antd";

import { FormInstance } from "antd";
import { EvaluatorDataModel } from "@/app/models/evaluator";
import EvaluatorForm from "../../../form/admin/evaluator";

export default function EvaluatorModal({
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
  handleFinish: (values: EvaluatorDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<EvaluatorDataModel>;
  type: "create" | "update";
  initialValues?: EvaluatorDataModel;
}) {
  return (
    <Modal
      open={open}
      title={type === "create" ? "Tambah Pekerjaan" : "Edit Pekerjaan"}
      footer={null}
      onCancel={onClose}
    >
      <EvaluatorForm
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
