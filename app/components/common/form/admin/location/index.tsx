import { LocationDataModel } from "@/app/models/location";
import { Button, Form, Input, FormInstance } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";

export default function LocationForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  open,
  initialValues,
}: {
  onFinish: (values: LocationDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: LocationDataModel;
  form: FormInstance<LocationDataModel>;
  type: "create" | "update";
  open: boolean;
}) {
  useEffect(() => {
    if (!open) return; 
    if (type === "update" && initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
    } else {
      form.resetFields();
    }
  }, [open, type, initialValues, form]);
  return (
    <Form layout="vertical" onFinish={onFinish} form={form}>
      <Form.Item
        name="name"
        label="Name Location"
        rules={[{ required: true, message: "Name location is required" }]}
      >
        <Input placeholder="Add Name Location" size="large" />
      </Form.Item>
      <Form.Item
        name="address"
        label="Adress"
        rules={[{ required: true, message: "Address is required" }]}
      >
        <TextArea placeholder="Add Adress" size="large" />
      </Form.Item>
      <Form.Item
        name="maps_url"
        label="Maps"
        rules={[{ required: true, message: "Maps url is required" }]}
      >
        <Input placeholder="Maps" size="large" />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={type === "create" ? loadingCreate : loadingUpdate}
          size="large"
          style={{
            width: "100%",
            backgroundColor: "#C30010",
            borderColor: "#C30010",
          }}
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
