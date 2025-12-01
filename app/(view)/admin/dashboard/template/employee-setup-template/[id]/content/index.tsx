"use client";

import CustomButton from "@/app/components/common/custom-buttom";
import ActionTable from "@/app/components/common/action-table";
import EmployeeSetupQuestionModal from "@/app/components/common/modal/admin/employee-setup-question";
import { EmployeeSetupQuestionFormValues } from "@/app/components/common/form/admin/employee-setup-question";
import { useEmployeeSetup } from "@/app/hooks/employee-setup";
import {
  useEmployeeSetupQuestion,
  useEmployeeSetupQuestions,
} from "@/app/hooks/employee-setup-question";
import { EmployeeSetupDataModel } from "@/app/models/employee-setup";
import { makeActionsByType } from "@/app/utils/presets";
import {
  Card,
  Descriptions,
  Empty,
  Flex,
  Form,
  Space,
  Typography,
} from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import LoadingSplash from "@/app/components/common/custom-loading";

type EmployeeSetupQuestion =
  NonNullable<EmployeeSetupDataModel>["employeeSetupQuestion"][number];

const { Title, Text } = Typography;

export default function DetailEmployeeSetup() {
  const params = useParams();
  const employeeSetupIdParam = params?.id;
  const employeeSetupId = Array.isArray(employeeSetupIdParam)
    ? employeeSetupIdParam[0]
    : employeeSetupIdParam;

  const [form] = Form.useForm<EmployeeSetupQuestionFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [selectedQuestion, setSelectedQuestion] =
    useState<EmployeeSetupQuestion | null>(null);

  const {
    data: employeeSetup,
    fetchLoading,
    refetch,
  } = useEmployeeSetup({
    id: employeeSetupId ?? "",
  });

  const { onCreate, onCreateLoading, onDelete } = useEmployeeSetupQuestions();
  const { onUpdate, onUpdateLoading } = useEmployeeSetupQuestion();

  const questions = employeeSetup?.employeeSetupQuestion ?? [];

  const closeModal = () => {
    setModalOpen(false);
    setModalType("create");
    setSelectedQuestion(null);
    form.resetFields();
  };

  const handleAdd = () => {
    setSelectedQuestion(null);
    setModalType("create");
    setModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const target = questions.find((question) => question.id === id);
    if (!target) return;
    setSelectedQuestion(target);
    form.setFieldsValue({
      name_activity: target.name_activity,
      executor: target.executor,
    });
    setModalType("update");
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    await refetch();
  };

  const handleFinish = async (values: EmployeeSetupQuestionFormValues) => {
    if (!employeeSetupId) return;
    if (modalType === "create") {
      await onCreate({
        ...values,
        employeeSetupId,
      });
    } else if (selectedQuestion?.id) {
      await onUpdate({
        id: selectedQuestion.id,
        payload: values,
      });
    }
    await refetch();
    closeModal();
  };

  const isLoading = fetchLoading && !employeeSetup;

  if (!employeeSetupId) {
    return (
      <Card>
        <Text>ID employee setup tidak ditemukan.</Text>
      </Card>
    );
  }

  return (
    <div>
      <Flex align="center" gap={12} style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Detail Employee Setup
        </Title>
      </Flex>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <LoadingSplash />
        </div>
      ) : !employeeSetup ? (
        <Empty description="Employee setup not found" />
      ) : (
        <Space direction="vertical" size={24} style={{ width: "100%" }}>
          <Card>
            <Descriptions column={{ xs: 1, md: 2 }} title={employeeSetup.name}>
              <Descriptions.Item label="Total Activity">
                {questions.length}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title="Activity List"
            extra={
              <CustomButton
                title="Add Activity"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              />
            }
          >
            {questions.length === 0 ? (
              <Empty description="There is no activity on this employee setup yet" />
            ) : (
              <Space direction="vertical" style={{ width: "100%" }} size={12}>
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    style={{
                      border: "1px solid #f0f0f0",
                      borderRadius: 12,
                      padding: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <Space direction="vertical" size={4}>
                      <Text type="secondary">Activity #{index + 1}</Text>
                      <Text style={{ fontSize: 16, fontWeight: 600 }}>
                        {question.name_activity}
                      </Text>
                      <Text>Executor: {question.executor}</Text>
                    </Space>

                    <ActionTable
                      id={question.id}
                      items={makeActionsByType({
                        type: "default",
                        confirmDelete: {
                          title: "Delete Activity",
                          description: `Activity "${question.name_activity}" will be deleted.`,
                          okText: "Delete",
                        },
                        onEdit: (id) => handleEdit(id),
                        onDelete: (id) => handleDelete(id),
                      })}
                    />
                  </div>
                ))}
              </Space>
            )}
          </Card>
        </Space>
      )}

      <EmployeeSetupQuestionModal
        open={modalOpen}
        onClose={closeModal}
        form={form}
        type={modalType}
        handleFinish={handleFinish}
        loadingCreate={onCreateLoading}
        loadingUpdate={onUpdateLoading}
        initialValues={
          modalType === "update"
            ? {
                name_activity: selectedQuestion?.name_activity ?? "",
                executor: selectedQuestion?.executor ?? "",
              }
            : null
        }
      />
    </div>
  );
}
