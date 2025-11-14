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
        >
          {sections.map((section) => (
            <Panel
              header={
                <span
                  style={{ color: "#2262e7", fontWeight: 600, fontSize: 17 }}
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
          style={{ marginTop: 16, height: 46, borderRadius: 12 }}
          onClick={onApplyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
