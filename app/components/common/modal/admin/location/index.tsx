import { Modal } from "antd";
import { FormInstance } from "antd";
import { LocationDataModel } from "@/app/models/location";
import LocationForm from "../../../form/admin/location";

export default function LocationModal({
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
  handleFinish: (values: LocationDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<LocationDataModel>;
  type: "create" | "update";
  initialValues?: LocationDataModel;
}) {
  return (
    <Modal
      open={open}
      title={type === "create" ? "Add Location" : "Edit Location"}
      footer={null}
      onCancel={onClose}
    >
      <LocationForm
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
