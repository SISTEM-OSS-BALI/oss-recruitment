import { useCardTemplates } from "@/app/hooks/card-template";
import { useContractTemplate } from "@/app/hooks/contract-template";
import { CardTemplateDataModel } from "@/app/models/card-template";
import { useState } from "react";
import { CardTemplateColumns } from "./columns";
import Title from "antd/es/typography/Title";
import SearchBar from "@/app/components/common/search-bar";
import CustomButton from "@/app/components/common/custom-buttom";
import { Flex, Form, Table } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import CardTemplateModal from "@/app/components/common/modal/admin/card-template";

export default function CardTemplate() {
  const [form] = Form.useForm<CardTemplateDataModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [selectedCardTemplate, setSelectedCardTemplate] =
    useState<CardTemplateDataModel | null>(null);

  const {
    data: cardTemplatesData,
    onCreate: cardTemplateCreate,
    onCreateLoading: cardTemplateLoadingCreate,
    onDelete: onDeletecardTemplate,
  } = useCardTemplates({});

   const {
      onUpdate: cardTemplateUpdate,
      onUpdateLoading: cardTemplateLoadingUpdate,
    } = useContractTemplate({
      id: selectedCardTemplate?.id || "",
    });

    const handleEdit = (id: string) => {
        const contractTemplateEdit = cardTemplatesData?.find(
          (contractTemplate) => contractTemplate.id === id
        );
        if (contractTemplateEdit) {
          setSelectedCardTemplate(contractTemplateEdit);
          setModalType("update");
          setModalOpen(true);
        }
      };
    
      const columns = CardTemplateColumns({
        onDelete: (id) => onDeletecardTemplate(id),
        onEdit: (id) => handleEdit(id),
      });
    
      const handleFinish = async (values: CardTemplateDataModel) => {
        if (modalType === "create") {
          await cardTemplateCreate(values);
        } else if (selectedCardTemplate?.id) {
          await cardTemplateUpdate({
            id: selectedCardTemplate.id,
            payload: values,
          });
        }
        form.resetFields();
        setSelectedCardTemplate(null);
        setModalOpen(false);
        setModalType("create");
      };
    
  return (
    <div>
      <div>
        <Title level={4}>Card Referral Management</Title>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Flex justify="space-between">
          <SearchBar onSearch={() => {}} />
          <CustomButton
            title="Add Card Template"
            onClick={() => {
              form.resetFields();
              setSelectedCardTemplate(null);
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
          dataSource={cardTemplatesData}
          rowKey={"id"}
        />
      </div>
      <div>
        <CardTemplateModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            form.resetFields();
            setSelectedCardTemplate(null);
            setModalType("create");
          }}
          initialValues={
            modalType == "update"
              ? selectedCardTemplate?? undefined
              : undefined
          }
          form={form}
          type={modalType}
          handleFinish={handleFinish}
          loadingCreate={cardTemplateLoadingCreate}
          loadingUpdate={cardTemplateLoadingUpdate}
        />
      </div>
    </div>
  );
}
