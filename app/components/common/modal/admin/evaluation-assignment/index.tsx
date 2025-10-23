import { Modal } from "antd";
import EvaluationAssignmentForm, {
  CreatePayload,
  UpdatePayload,
} from "../../../form/admin/evaluation-assignment";

type EvaluationAssignmentModalProps = {
  open: boolean;
  onClose: () => void;
  handleFinish: (values: CreatePayload | UpdatePayload) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  type: "create" | "update";
  initialValues?: Partial<UpdatePayload> & {
    base_matriks_id?: string;
    evaluatorId?: string;
    status?: any;
    link_url?: string | null;
  };
  applicantId?: string; // ⬅️ penting untuk CREATE
};

export default function EvaluationAssignmentModal({
  open,
  onClose,
  handleFinish,
  loadingCreate,
  loadingUpdate,
  type,
  initialValues,
  applicantId,
}: EvaluationAssignmentModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      title={
        type === "create"
          ? "Create Evaluation Assignment"
          : "Update Evaluation Assignment"
      }
    >
      <EvaluationAssignmentForm
        handleFinish={handleFinish}
        loadingCreate={loadingCreate}
        loadingUpdate={loadingUpdate}
        type={type}
        initialValues={initialValues}
        applicantId={applicantId} // ⬅️ PASS KE FORM
      />
    </Modal>
  );
}
