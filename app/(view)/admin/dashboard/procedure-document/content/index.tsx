import {
  useProcedureDocument,
  useProcedureDocuments,
} from "@/app/hooks/procedure-document";
import { ProcedureDocumentDataModel } from "@/app/models/procedure-documents";
import { Flex, Form, Table } from "antd";
import { useState } from "react";
import { ProdecureDocumentColumns } from "./columns";
import Title from "antd/es/typography/Title";
import SearchBar from "@/app/components/common/search-bar";
import CustomButton from "@/app/components/common/custom-buttom";
import { PlusOutlined } from "@ant-design/icons";
import ProcedureDocumentModal from "@/app/components/common/modal/admin/procedure-document";

export default function ProcedureDocumentContent() {
  const [form] = Form.useForm<ProcedureDocumentDataModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [selectedLocation, setSelectedLocation] =
    useState<ProcedureDocumentDataModel | null>(null);

  const {
    data: procedureDocumentData,
    onCreate: procedureDocumentCreate,
    onCreateLoading: procedureDocumentLoadingCreate,
    onDelete: onDeleteProcedureDocument,
  } = useProcedureDocuments({});

  const {
    onUpdate: procedureDocumentUpdate,
    onUpdateLoading: procedureDocumentLoadingUpdate,
  } = useProcedureDocument({
    id: selectedLocation?.id || "",
  });

  const handleEdit = (id: string) => {
    const jobEdit = procedureDocumentData?.find(
      (location) => location.id === id
    );
    if (jobEdit) {
      setSelectedLocation(jobEdit);
      setModalType("update");
      setModalOpen(true);
    }
  };

  const columns = ProdecureDocumentColumns({
    onDelete: (id) => onDeleteProcedureDocument(id),
    onEdit: (id) => handleEdit(id),
  });

  const handleFinish = async (values: ProcedureDocumentDataModel) => {
    if (modalType === "create") {
      await procedureDocumentCreate(values);
    } else if (selectedLocation?.id) {
      await procedureDocumentUpdate({
        id: selectedLocation.id,
        payload: values,
      });
    }
    form.resetFields();
    setSelectedLocation(null);
    setModalOpen(false);
    setModalType("create");
  };
  return (
    <div>
      <div>
        <Title level={4}>Procedure Document Management</Title>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Flex justify="space-between">
          <SearchBar onSearch={() => {}} />
          <CustomButton
            title="Add Procedure Document"
            onClick={() => {
              form.resetFields();
              setSelectedLocation(null);
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
          dataSource={procedureDocumentData}
          rowKey={"id"}
        />
      </div>
      <div>
        <ProcedureDocumentModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            form.resetFields();
            setSelectedLocation(null);
            setModalType("create");
          }}
          form={form}
          type={modalType}
          initialValues={
            modalType === "update" ? selectedLocation ?? undefined : undefined
          }
          handleFinish={handleFinish}
          loadingCreate={procedureDocumentLoadingCreate}
          loadingUpdate={procedureDocumentLoadingUpdate}
        />
      </div>
    </div>
  );
}
