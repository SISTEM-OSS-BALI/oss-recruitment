import { Collapse, Button, Space } from "antd";
import {
  FilterOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import FilterOptions, {
  type FilterOption,
} from "@/app/components/select/user/filter-option-job";
import type { ReactNode } from "react";

const { Panel } = Collapse;

export type FilterSidebarSection = {
  key: string;
  title: string;
  icon: ReactNode;
  options: FilterOption[];
  value: string[];
  onChange: (v: string[]) => void;
};

export default function FilterSidebar({
  sections,
  clearFilters,
  onApplyFilters,
}: {
  sections: FilterSidebarSection[];
  clearFilters: () => void;
  onApplyFilters: () => void;
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
        <span style={{ fontWeight: 700, color: "#1d4ed8", fontSize: 20 }}>
          <FilterOutlined style={{ marginRight: 8 }} />
          Filter
        </span>
        <Button
          type="text"
          danger
          icon={<CloseCircleOutlined />}
          onClick={clearFilters}
          style={{ fontWeight: 600, fontSize: 15 }}
        >
          Clear filter
        </Button>
      </Space>
      <div
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: 20,
          border: "1px solid rgba(148,163,184,0.25)",
          boxShadow: "0 18px 32px rgba(15,23,42,0.08)",
          padding: 20,
        }}
      >
        <Collapse
          ghost
          expandIconPosition="end"
          style={{ background: "transparent" }}
        >
          {sections.map((section) => (
            <Panel
              header={
                <span
                  style={{ color: "#1d4ed8", fontWeight: 600, fontSize: 16 }}
                >
                  <span style={{ marginRight: 10 }}>{section.icon}</span>
                  {section.title}
                </span>
              }
              key={section.key}
            >
              <FilterOptions
                options={section.options}
                value={section.value}
                onChange={section.onChange}
              />
            </Panel>
          ))}
        </Collapse>
        <Button
          type="primary"
          block
          style={{
            marginTop: 18,
            height: 46,
            borderRadius: 14,
            fontWeight: 600,
            boxShadow: "0 10px 18px rgba(37,99,235,0.25)",
          }}
          onClick={onApplyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
