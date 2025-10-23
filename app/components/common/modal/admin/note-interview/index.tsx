import { Modal } from "antd";
import { FormInstance } from "antd";
import { NoteInterviewDataModel } from "@/app/models/note-interview";
import NoteInterviewForm from "../../../form/admin/note-interview";

export default function NoteInterviewModal({
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
  handleFinish: (values: NoteInterviewDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<NoteInterviewDataModel>;
  type: "create" | "update";
  initialValues?: NoteInterviewDataModel;
}) {
  return (
    <Modal
      open={open}
      title={type === "create" ? "Add Note Interview" : "Edit Note Interview"}
      footer={null}
      onCancel={onClose}
    >
      <NoteInterviewForm
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
