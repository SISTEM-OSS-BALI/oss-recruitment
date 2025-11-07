import { useConsultant, useConsultants } from "@/app/hooks/consultant";
import { ConsultantDataModel } from "@/app/models/consultant";
import { useState } from "react";
import { ConsultantColumns } from "./columns";
import { Flex, Form, Table } from "antd";
import SearchBar from "@/app/components/common/search-bar";
import CustomButton from "@/app/components/common/custom-buttom";
import { PlusOutlined } from "@ant-design/icons";
import ConsultantModal from "@/app/components/common/modal/admin/consultant";
import Title from "antd/es/typography/Title";

export default function ConsultantContent() {
  const [form] = Form.useForm<ConsultantDataModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [selectedConsultant, setSelectedConsultant] =
    useState<ConsultantDataModel | null>(null);

  const {
    data: consultantData,
    onCreate: consultantCreate,
    onCreateLoading: consultantLoadingCreate,
    onDelete: onDeleteConsultant,
  } = useConsultants({});

  const {
    onUpdate: consultantUpdate,
    onUpdateLoading: consultantLoadingUpdate,
  } = useConsultant({
    id: selectedConsultant?.id || "",
  });
  const handleEdit = (id: string) => {
    const jobEdit = consultantData?.find((location) => location.id === id);
    if (jobEdit) {
      setSelectedConsultant(jobEdit);
      setModalType("update");
      setModalOpen(true);
    }
  };

  const columns = ConsultantColumns({
    onDelete: (id) => onDeleteConsultant(id),
    onEdit: (id) => handleEdit(id),
  });

  const handleFinish = async (values: ConsultantDataModel) => {
    if (modalType === "create") {
      await consultantCreate(values);
      console.log(values);
    } else if (selectedConsultant?.id) {
      await consultantUpdate({ id: selectedConsultant.id, payload: values });
    }
    form.resetFields();
    setSelectedConsultant(null);
    setModalOpen(false);
    setModalType("create");
  };
  return (
    <div>
      <div>
        <Title level={4}>Consultant Management</Title>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Flex justify="space-between">
          <SearchBar onSearch={() => {}} />
          <CustomButton
            title="Add Consultant"
            onClick={() => {
              form.resetFields();
              setSelectedConsultant(null);
              setModalType("create");
              setModalOpen(true);
            }}
            icon={<PlusOutlined />}
          />
        </Flex>
      </div>
      <div>
        <Table columns={columns} dataSource={consultantData} rowKey={"id"} />
      </div>
      <div>
        <ConsultantModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            form.resetFields();
            setSelectedConsultant(null);
            setModalType("create");
          }}
          initialValues={
            modalType == "update" ? selectedConsultant ?? undefined : undefined
          }
          form={form}
          type={modalType}
          handleFinish={handleFinish}
          loadingCreate={consultantLoadingCreate}
          loadingUpdate={consultantLoadingUpdate}
        />
      </div>
    </div>
  );
}
