import { Collapse, Button, Space } from "antd";
import {
  FilterOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
  UserOutlined,
  ApartmentOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import FilterOptions from "@/app/components/select/user/filter-option-job";

const { Panel } = Collapse;

const dummyStatus = ["Open", "Closed"];
const dummyClients = ["MSC Cruise", "Bulgaria"];
const dummyDepartments = ["Galley", "Rooms"];
const dummyPositions = ["Butcher", "Housekeeping Public Area"];

export default function FilterSidebar({
  status,
  setStatus,
  client,
  setClient,
  department,
  setDepartment,
  position,
  setPosition,
  clearFilters,
}: {
  status: string[];
  setStatus: (v: string[]) => void;
  client: string[];
  setClient: (v: string[]) => void;
  department: string[];
  setDepartment: (v: string[]) => void;
  position: string[];
  setPosition: (v: string[]) => void;
  clearFilters: () => void;
}) {
  return (
    <div style={{ width: "100%", maxWidth: 320 }}>
      <Space
        style={{
          marginBottom: 20,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontWeight: 700, color: "#2262e7", fontSize: 22 }}>
          <FilterOutlined style={{ marginRight: 8 }} />
          Filter
        </span>
        <Button
          type="link"
          danger
          icon={<CloseCircleOutlined />}
          onClick={clearFilters}
          style={{ fontWeight: 600, fontSize: 17 }}
        >
          Clear filter
        </Button>
      </Space>
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1.5px solid #e6eeff",
          boxShadow: "0 2px 8px rgba(34,98,231,0.03)",
          padding: 22,
        }}
      >
        <Collapse
          ghost
          expandIconPosition="end"
          style={{ background: "transparent" }}
          defaultActiveKey={[]}
        >
          <Panel
            header={
              <span style={{ color: "#2262e7", fontWeight: 600, fontSize: 17 }}>
                <AppstoreOutlined style={{ marginRight: 10 }} />
                Status
              </span>
            }
            key="1"
          >
            <FilterOptions
              options={dummyStatus}
              value={status}
              onChange={setStatus}
            />
          </Panel>
          <Panel
            header={
              <span style={{ color: "#2262e7", fontWeight: 600, fontSize: 17 }}>
                <UserOutlined style={{ marginRight: 10 }} />
                Client
              </span>
            }
            key="2"
          >
            <FilterOptions
              options={dummyClients}
              value={client}
              onChange={setClient}
            />
          </Panel>
          <Panel
            header={
              <span style={{ color: "#2262e7", fontWeight: 600, fontSize: 17 }}>
                <ApartmentOutlined style={{ marginRight: 10 }} />
                Department
              </span>
            }
            key="3"
          >
            <FilterOptions
              options={dummyDepartments}
              value={department}
              onChange={setDepartment}
            />
          </Panel>
          <Panel
            header={
              <span style={{ color: "#2262e7", fontWeight: 600, fontSize: 17 }}>
                <ProfileOutlined style={{ marginRight: 10 }} />
                Position
              </span>
            }
            key="4"
          >
            <FilterOptions
              options={dummyPositions}
              value={position}
              onChange={setPosition}
            />
          </Panel>
        </Collapse>
      </div>
    </div>
  );
}
