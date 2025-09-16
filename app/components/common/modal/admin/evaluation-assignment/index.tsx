import { Modal } from "antd";
import EvaluationAssignmentForm from "../../../form/admin/evaluation-assignment";
import { EvaluatorAssignmentDataModel } from "@/app/models/evaluator-assignment";

type EvaluationAssignmentModalProps = {
  open: boolean;
  onClose: () => void;
  handleFinish: (values: EvaluatorAssignmentDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  type: "create" | "update";
  initialValues?: EvaluatorAssignmentDataModel;
};

export default function EvaluationAssignmentModal({
  open,
  onClose,
  handleFinish,
  loadingCreate,
  loadingUpdate,
  type,
  initialValues,
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
        onClose={onClose}
        handleFinish={handleFinish}
        loadingCreate={loadingCreate}
        loadingUpdate={loadingUpdate}
        type={type}
        initialValues={initialValues}
      />
    </Modal>
  );
}
