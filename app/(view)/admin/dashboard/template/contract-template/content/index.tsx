import {
  useContractTemplate,
  useContractTemplates,
} from "@/app/hooks/contract-template";
import { ContractTemplateDataModel } from "@/app/models/contract-template";
import { Flex, Form, Table } from "antd";
import { useState } from "react";
import { ContractTemplateColumns } from "./columns";
import Title from "antd/es/typography/Title";
import SearchBar from "@/app/components/common/search-bar";
import CustomButton from "@/app/components/common/custom-buttom";
import { PlusOutlined } from "@ant-design/icons";
import ContractTemplateModal from "@/app/components/common/modal/admin/contract-template";

export default function ContractTemplateContent() {
  const [form] = Form.useForm<ContractTemplateDataModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [selectedContractTemplate, setSelectedContractTemplate] =
    useState<ContractTemplateDataModel | null>(null);

  const {
    data: contractTemplatesData,
    onCreate: contractTemplateCreate,
    onCreateLoading: contractTemplateLoadingCreate,
    onDelete: onDeleteContractTemplate,
  } = useContractTemplates({});

  const {
    onUpdate: contractTemplateUpdate,
    onUpdateLoading: contractTemplateLoadingUpdate,
  } = useContractTemplate({
    id: selectedContractTemplate?.id || "",
  });

  const handleEdit = (id: string) => {
    const contractTemplateEdit = contractTemplatesData?.find(
      (contractTemplate) => contractTemplate.id === id
    );
    if (contractTemplateEdit) {
      setSelectedContractTemplate(contractTemplateEdit);
      setModalType("update");
      setModalOpen(true);
    }
  };

  const columns = ContractTemplateColumns({
    onDelete: (id) => onDeleteContractTemplate(id),
    onEdit: (id) => handleEdit(id),
  });

  const handleFinish = async (values: ContractTemplateDataModel) => {
    if (modalType === "create") {
      await contractTemplateCreate(values);
    } else if (selectedContractTemplate?.id) {
      await contractTemplateUpdate({
        id: selectedContractTemplate.id,
        payload: values,
      });
    }
    form.resetFields();
    setSelectedContractTemplate(null);
    setModalOpen(false);
    setModalType("create");
  };

  return (
    <div>
      <div>
        <Title level={4}>Contract Management</Title>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Flex justify="space-between">
          <SearchBar onSearch={() => {}} />
          <CustomButton
            title="Add Contact Template"
            onClick={() => {
              form.resetFields();
              setSelectedContractTemplate(null);
              setModalType("create");
              setModalOpen(true);
            }}
            icon={<PlusOutlined />}
          />
        </Flex>
      </div>
      <div>
        <Table
          columns={columns}
          dataSource={contractTemplatesData}
          rowKey={"id"}
        />
      </div>
      <div>
        <ContractTemplateModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            form.resetFields();
            setSelectedContractTemplate(null);
            setModalType("create");
          }}
          initialValues={
            modalType == "update"
              ? selectedContractTemplate ?? undefined
              : undefined
          }
          form={form}
          type={modalType}
          handleFinish={handleFinish}
          loadingCreate={contractTemplateLoadingCreate}
          loadingUpdate={contractTemplateLoadingUpdate}
        />
      </div>
    </div>
  );
}
