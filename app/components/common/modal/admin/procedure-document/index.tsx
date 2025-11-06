import { Modal } from "antd";
import { FormInstance } from "antd";

import { ProcedureDocumentDataModel } from "@/app/models/procedure-documents";
import ProcedureDocumentForm from "../../../form/admin/procedure-document";

export default function ProcedureDocumentModal({
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
  handleFinish: (values: ProcedureDocumentDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<ProcedureDocumentDataModel>;
  type: "create" | "update";
  initialValues?: ProcedureDocumentDataModel;
}) {
  return (
    <Modal
      open={open}
      title={
        type === "create"
          ? "Add Procedure Document"
          : "Edit Procedure Documents"
      }
      footer={null}
      onCancel={onClose}
    >
      <ProcedureDocumentForm
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
