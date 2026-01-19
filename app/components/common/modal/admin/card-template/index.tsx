import { CardTemplateDataModel } from "@/app/models/card-template";
import { Modal } from "antd";
import { FormInstance } from "antd";
import CardTemplateForm from "../../../form/admin/card-template";

export default function CardTemplateModal({
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
  handleFinish: (values: CardTemplateDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<CardTemplateDataModel>;
  type: "create" | "update";
  initialValues?: CardTemplateDataModel;
}) {
  return (
    <Modal
      open={open}
      title={type === "create" ? "Add Card Referral Template" : "Edit Card Refereral Template"}
      footer={null}
      onCancel={onClose}
    >
      <CardTemplateForm
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
