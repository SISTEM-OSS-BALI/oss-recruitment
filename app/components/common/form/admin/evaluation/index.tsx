import { EvaluatorDataModel } from "@/app/models/evaluator";
import { Form, FormInstance, Input } from "antd";

export default function EvaluationForm({}: {
  open: boolean;
  onClose: () => void;
  handleFinish: (values: EvaluatorDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  form: FormInstance<EvaluatorDataModel>;
  type: "create" | "update";
  initialValues?: EvaluatorDataModel;
}) {
  const [form] = Form.useForm<EvaluatorDataModel>();
  return (
    <Form form={form}>
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
    </Form>
  );
}
