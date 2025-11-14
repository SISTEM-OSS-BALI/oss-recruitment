import { Space, Typography } from "antd";

export type FilterOption = {
  label: string;
  value: string;
};

export default function FilterOptions({
  options,
  value,
  onChange,
}: {
  options: FilterOption[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  if (!options.length) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: 13 }}>
        No data available
      </Typography.Text>
    );
  }

  const toggleValue = (checked: boolean, optionValue: string) => {
    if (checked) {
      onChange(Array.from(new Set([...value, optionValue])));
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      {options.map((opt) => (
        <label
          key={opt.value}
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={value.includes(opt.value)}
            onChange={(e) => toggleValue(e.target.checked, opt.value)}
            style={{ marginRight: 8 }}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </Space>
  );
}
