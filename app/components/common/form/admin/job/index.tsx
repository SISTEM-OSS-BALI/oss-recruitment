import { useLocations } from "@/app/hooks/location";
import { JobDataModel } from "@/app/models/job";
import {
  Button,
  Form,
  Input,
  FormInstance,
  Select,
  Checkbox,
  DatePicker,
} from "antd";
import { useEffect } from "react";
import ReactQuill from "react-quill";

export default function JobForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  initialValues,
  open,
}: {
  onFinish: (values: JobDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: JobDataModel;
  form: FormInstance<JobDataModel>;
  type: "create" | "update";
  open: boolean;
}) {
  useEffect(() => {
    if (!open) return; // only when modal is open
    if (type === "update" && initialValues) {
      form.setFieldsValue({
        ...initialValues,
      });
    } else {
      form.resetFields();
    }
  }, [open, type, initialValues, form]);
  const { data: locations } = useLocations({});
  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      form={form}
      initialValues={initialValues}
    >
      <Form.Item
        name="name"
        label="Name Job"
        rules={[{ required: true, message: "Name Job is required" }]}
      >
        <Input placeholder="Add Name Job" size="large" />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Description is required" }]}
      >
        <ReactQuill placeholder="Add Description" theme="snow" />
      </Form.Item>
      <Form.Item
        label="Until At"
        name="until_at"
        rules={[{ required: true, message: "Date is required" }]}
      >
        <DatePicker
          style={{ width: "100%" }}
          format="DD MMMM YYYY"
          placeholder="Select Date"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="location_id"
        label="Location"
        rules={[{ required: true, message: "Location is required" }]}
      >
        <Select size="large">
          {locations?.map((location) => (
            <Select.Option key={location.id} value={location.id}>
              {location.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="is_published" valuePropName="checked">
        <Checkbox>
          Publish{" "}
          <span
            style={{
              fontStyle: "italic",
              color: "#888",
            }}
          >
            * If checked, the job will be visible to candidates
          </span>
        </Checkbox>
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
