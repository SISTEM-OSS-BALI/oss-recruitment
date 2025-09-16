import { useEffect } from "react";
import { Button, Form, FormInstance, Select, Tag } from "antd";
import { EvaluatorAssignmentDataModel } from "@/app/models/evaluator-assignment";
import { useEvalutors } from "@/app/hooks/evaluator";

type Props = {
  handleFinish: (values: EvaluatorAssignmentDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  type: "create" | "update";
  initialValues?: EvaluatorAssignmentDataModel;
  form?: FormInstance<EvaluatorAssignmentDataModel>;
};

export default function EvaluationAssignmentForm({
  handleFinish,
  loadingCreate,
  loadingUpdate,
  type,
  initialValues,
  form: externalForm,
}: Props) {
  const [form] = Form.useForm<EvaluatorAssignmentDataModel>();
  const usedForm = externalForm ?? form;

  const { data: evaluatorsData, onCreateLoading: loadingEvaluators } =
    useEvalutors({});

  useEffect(() => {
    if (initialValues) {
      usedForm.setFieldsValue(initialValues);
    } else {
      usedForm.resetFields();
    }
  }, [initialValues, usedForm]);

  const submitting = loadingCreate || loadingUpdate;

  // Watch nilai terpilih untuk ditampilkan sebagai Tag
  const selectedIds = Form.useWatch<string[]>("evaluatorIds", usedForm) ?? [];
  const idToLabel = new Map(evaluatorsData?.map((e) => [e.id, e.name]) ?? []);

  return (
    <Form
      form={usedForm}
      layout="vertical"
      onFinish={handleFinish}
      disabled={submitting}
    >
      <Form.Item
        name="evaluatorIds"
        label="Evaluators"
        rules={[{ required: true, message: "Pilih minimal satu evaluator" }]}
      >
        <Select
          mode="multiple"
          placeholder="Pilih evaluator"
          loading={loadingEvaluators}
          options={evaluatorsData?.map((e) => ({
            label: e.name,
            value: e.id,
          }))}
          showSearch
          optionFilterProp="label"
          allowClear
          maxTagCount="responsive"
          tagRender={(tagProps) => {
            const { label, value, closable, onClose } = tagProps;
            return (
              <Tag
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 4 }}
              >
                {label ?? idToLabel.get(value as string) ?? value}
              </Tag>
            );
          }}
        />
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
