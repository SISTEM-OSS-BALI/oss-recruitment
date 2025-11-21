import { FormInstance, Modal } from "antd";
import EmployeeSetupQuestionForm, {
  EmployeeSetupQuestionFormValues,
} from "../../../form/admin/employee-setup-question";

export default function EmployeeSetupQuestionModal({
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
  handleFinish: (values: EmployeeSetupQuestionFormValues) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<EmployeeSetupQuestionFormValues>;
  type: "create" | "update";
  initialValues?: EmployeeSetupQuestionFormValues | null;
}) {
  return (
    <Modal
      open={open}
      title={
        type === "create"
          ? "Tambah Aktivitas Employee Setup"
          : "Edit Aktivitas Employee Setup"
      }
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      <EmployeeSetupQuestionForm
        open={open}
        onFinish={handleFinish}
        loadingCreate={loadingCreate}
        loadingUpdate={loadingUpdate}
        form={form}
        type={type}
        initialValues={initialValues ?? undefined}
      />
    </Modal>
  );
}
