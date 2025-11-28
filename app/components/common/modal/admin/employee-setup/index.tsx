import { EmployeeSetupDataModel } from "@/app/models/employee-setup";
import { FormInstance, Modal } from "antd";
import EmployeeSetupForm, {
  EmployeeSetupFormValues,
} from "../../../form/admin/employee-setup";

export default function EmployeeSetupModal({
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
  handleFinish: (values: EmployeeSetupFormValues) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<EmployeeSetupFormValues>;
  type: "create" | "update";
  initialValues?: EmployeeSetupDataModel | null;
}) {
  return (
    <Modal
      open={open}
      title={type === "create" ? "Add Employee Setup" : "Edit Employee Setup"}
      footer={null}
      onCancel={onClose}
      destroyOnClose
    >
      <EmployeeSetupForm
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
