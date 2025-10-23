import { NoteInterviewDataModel } from "@/app/models/note-interview";
import { Button, Form, FormInstance } from "antd";
import TextArea from "antd/es/input/TextArea";
import { useEffect } from "react";

export default function NoteInterviewForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  open,
  initialValues,
}: {
  onFinish: (values: NoteInterviewDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: NoteInterviewDataModel;
  form: FormInstance<NoteInterviewDataModel>;
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
        name="note"
        label="Note Interview"
      >
        <TextArea placeholder="Add Note" size="large" />
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
