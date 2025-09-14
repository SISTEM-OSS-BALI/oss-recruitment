import { Flex, Form, Table } from "antd";
import { useState } from "react";
import Title from "antd/es/typography/Title";
import SearchBar from "@/app/components/common/search-bar";
import CustomButton from "@/app/components/common/custom-buttom";
import { PlusOutlined } from "@ant-design/icons";
import { useLocation, useLocations } from "@/app/hooks/location";
import { LocationDataModel } from "@/app/models/location";
import { LocationColumns } from "./columns";
import LocationModal from "@/app/components/common/modal/admin/location";

export default function SettingJobContent() {
  const [form] = Form.useForm<LocationDataModel>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"create" | "update">("create");
  const [selectedLocation, setSelectedLocation] =
    useState<LocationDataModel | null>(null);

  const {
    data: locationsData,
    onCreate: locationCreate,
    onCreateLoading: locationLoadingCreate,
    onDelete: onDeleteLocation,
  } = useLocations({});

  const { onUpdate: locationUpdate, onUpdateLoading: locationLoadingUpdate } =
    useLocation({
      id: selectedLocation?.id || "",
    });

  const handleEdit = (id: string) => {
    const jobEdit = locationsData?.find((location) => location.id === id);
    if (jobEdit) {
      setSelectedLocation(jobEdit);
      setModalType("update");
      setModalOpen(true);
    }
  };

  const columns = LocationColumns({
    onDelete: (id) => onDeleteLocation(id),
    onEdit: (id) => handleEdit(id),
  });

  const handleFinish = async (values: LocationDataModel) => {
    if (modalType === "create") {
      await locationCreate(values);
      console.log(values);
    } else if (selectedLocation?.id) {
      await locationUpdate({ id: selectedLocation.id, payload: values });
    }
    form.resetFields();
    setSelectedLocation(null);
    setModalOpen(false);
    setModalType("create");
  };
  return (
    <div>
      <div>
        <Title level={4}>Location Management</Title>
      </div>
      <div style={{ marginBottom: 24 }}>
        <Flex justify="space-between">
          <SearchBar onSearch={() => {}} />
          <CustomButton
            title="Add Location"
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
        <Table columns={columns} dataSource={locationsData} rowKey={"id"} />
      </div>
      <div>
        <LocationModal
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
          loadingCreate={locationLoadingCreate}
          loadingUpdate={locationLoadingUpdate}
        />
      </div>
    </div>
  );
}
