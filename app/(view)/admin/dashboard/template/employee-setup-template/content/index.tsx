"use client";

import CustomButton from "@/app/components/common/custom-buttom";
import SearchBar from "@/app/components/common/search-bar";
import EmployeeSetupModal from "@/app/components/common/modal/admin/employee-setup";
import ActionTable from "@/app/components/common/action-table";
import { EmployeeSetupFormValues } from "@/app/components/common/form/admin/employee-setup";
import {
  useEmployeeSetup,
  useEmployeeSetups,
} from "@/app/hooks/employee-setup";
import { EmployeeSetupDataModel } from "@/app/models/employee-setup";
import { makeActionsByType } from "@/app/utils/presets";
import { PlusOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Card, Empty, Flex, Form, Space, Spin, Tag, Typography } from "antd";
import { CSSProperties, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function EmployeeSetupTemplateContent() {
  const [form] = Form.useForm<EmployeeSetupFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();
  const [selectedEmployeeSetup, setSelectedEmployeeSetup] =
    useState<EmployeeSetupDataModel | null>(null);

  const {
    data: employeeSetupsData,
    fetchLoading,
    onCreate,
    onCreateLoading,
    onDelete: onDeleteEmployeeSetup,
  } = useEmployeeSetups({});

  const { onUpdate, onUpdateLoading } = useEmployeeSetup({
    id: selectedEmployeeSetup?.id || "",
  });

  const filteredEmployeeSetups = useMemo(() => {
    if (!employeeSetupsData) return [];
    if (!searchValue) return employeeSetupsData;

    return employeeSetupsData.filter((setup) =>
      setup.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [employeeSetupsData, searchValue]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleOpenModal = () => {
    form.resetFields();
    setSelectedEmployeeSetup(null);
    setModalType("create");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmployeeSetup(null);
    setModalType("create");
    form.resetFields();
  };

  const handleEdit = (id: string) => {
    const setupToEdit = employeeSetupsData?.find((setup) => setup.id === id);
    if (!setupToEdit) return;
    setSelectedEmployeeSetup(setupToEdit);
    setModalType("update");
    setModalOpen(true);
  };

  const handleCardClick = (id: string) => {
    router.push(`/admin/dashboard/template/employee-setup-template/${id}`);
  };

  const handleFinish = async (values: EmployeeSetupFormValues) => {
    if (modalType === "create") {
      await onCreate(values);
    } else if (selectedEmployeeSetup?.id) {
      await onUpdate({
        id: selectedEmployeeSetup.id,
        payload: values,
      });
    }

    handleCloseModal();
  };

  const renderCards = () => {
    if (fetchLoading) {
      return (
        <div style={{ padding: "40px 0", textAlign: "center" }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!filteredEmployeeSetups.length) {
      return (
        <Empty
          description={
            searchValue
              ? "Employee setup tidak ditemukan"
              : "Belum ada employee setup"
          }
        />
      );
    }

    return (
      <div style={cardGridStyle}>
        {filteredEmployeeSetups.map((setup) => {
          const questions = setup.employeeSetupQuestion ?? [];
          const displayedQuestions = questions.slice(0, 3);

          return (
            <Card
              key={setup.id}
              title={setup.name}
              extra={
                <ActionTable
                  id={setup.id}
                  items={makeActionsByType({
                    type: "default",
                    confirmDelete: {
                      title: "Hapus Employee Setup",
                      description: `Data "${setup.name}" akan dihapus permanen. Lanjutkan?`,
                      okText: "Delete",
                    },
                    onEdit: (id) => handleEdit(id),
                    onDelete: (id) => onDeleteEmployeeSetup(id),
                  })}
                />
              }
              bodyStyle={{ minHeight: 220, display: "flex" }}
            >
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Tag
                  icon={<UnorderedListOutlined />}
                  color="blue"
                  style={{ width: "fit-content" }}
                >
                  {questions.length} Activities
                </Tag>

                <div>
                  <Text strong>Activity</Text>
                  {displayedQuestions.length === 0 ? (
                    <Text type="secondary" style={{ display: "block" }}>
                      There is no activity on this employee setup yet
                    </Text>
                  ) : (
                    <Space
                      direction="vertical"
                      size={8}
                      style={{ width: "100%", marginTop: 8 }}
                    >
                      {displayedQuestions.map((question) => (
                        <div
                          key={question.id}
                          style={{
                            border: "1px solid #f0f0f0",
                            padding: 12,
                            borderRadius: 10,
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>
                            {question.name_activity}
                          </div>
                          <Text type="secondary">{question.executor}</Text>
                        </div>
                      ))}
                      {questions.length > displayedQuestions.length ? (
                        <Text type="secondary">
                          +{questions.length - displayedQuestions.length} more
                          activities
                        </Text>
                      ) : null}
                    </Space>
                  )}
                </div>

                <CustomButton
                  title="Manage Activities"
                  onClick={() => handleCardClick(setup.id)}
                  style={{ width: "100%" }}
                />
              </Space>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>Employee Setup Template</Title>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Flex justify="space-between" wrap gap={16}>
          <SearchBar onSearch={handleSearch} value={searchValue} width={320} />
          <CustomButton
            title="Add Employee Setup"
            onClick={handleOpenModal}
            icon={<PlusOutlined />}
          />
        </Flex>
      </div>

      {renderCards()}

      <EmployeeSetupModal
        open={modalOpen}
        onClose={handleCloseModal}
        form={form}
        type={modalType}
        handleFinish={handleFinish}
        loadingCreate={onCreateLoading}
        loadingUpdate={onUpdateLoading}
        initialValues={modalType === "update" ? selectedEmployeeSetup : null}
      />
    </div>
  );
}

const cardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};
