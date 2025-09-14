import { useEvalutor, useEvalutors } from "@/app/hooks/evaluator";
import { EvaluatorDataModel } from "@/app/models/evaluator";
import { useState } from "react";
import { EvaluatorColumns } from "./columns";
import Title from "antd/es/typography/Title";
import { Flex, Form, Table } from "antd";
import SearchBar from "@/app/components/common/search-bar";
import CustomButton from "@/app/components/common/custom-buttom";
import { PlusOutlined } from "@ant-design/icons";
import EvaluatorModal from "@/app/components/common/modal/admin/evaluator";

export default function EvaluatorComponent() {
  const [form] = Form.useForm<EvaluatorDataModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [selectedEvaluator, setSelectedEvaluator] =
    useState<EvaluatorDataModel | null>(null);

  const {
    data: evaluatorsData,
    onCreate: evaluatorCreate,
    onCreateLoading: evaluatorLoadingCreate,
    onDelete: onDeleteEvaluator,
  } = useEvalutors({});

  const { onUpdate: evaluatorUpdate, onUpdateLoading: locationLoadingUpdate } =
    useEvalutor({
      id: selectedEvaluator?.id || "",
    });

  const handleEdit = (id: string) => {
    const jobEdit = evaluatorsData?.find((location) => location.id === id);
    if (jobEdit) {
      setSelectedEvaluator(jobEdit);
      setModalType("update");
      setModalOpen(true);
    }
  };

  const columns = EvaluatorColumns({
    onDelete: (id) => onDeleteEvaluator(id),
    onEdit: (id) => handleEdit(id),
  });

  const handleFinish = async (values: EvaluatorDataModel) => {
    if (modalType === "create") {
      await evaluatorCreate(values);
      console.log(values);
    } else if (selectedEvaluator?.id) {
      await evaluatorUpdate({ id: selectedEvaluator.id, payload: values });
    }
    form.resetFields();
    setSelectedEvaluator(null);
    setModalOpen(false);
    setModalType("create");
  };
  return (
    <div>
      <div>
        <Title level={4}>Evaluator Management</Title>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Flex justify="space-between">
          <SearchBar onSearch={() => {}} />
          <CustomButton
            title="Add Evaluator"
            onClick={() => {
              form.resetFields();
              setSelectedEvaluator(null);
              setModalType("create");
              setModalOpen(true);
            }}
            icon={<PlusOutlined />}
          />
        </Flex>
      </div>
      <div>
        <Table columns={columns} dataSource={evaluatorsData} rowKey={"id"} />
      </div>
      <div>
        <EvaluatorModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            form.resetFields();
            setSelectedEvaluator(null);
            setModalType("create");
          }}
          form={form}
          type={modalType}
          initialValues={
            modalType === "update" ? selectedEvaluator ?? undefined : undefined
          }
          handleFinish={handleFinish}
          loadingCreate={evaluatorLoadingCreate}
          loadingUpdate={locationLoadingUpdate}
        />
      </div>
    </div>
  );
}
