import { Space } from "antd";

export default function FilterOptions({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      {options.map((opt) => (
        <label key={opt} style={{ display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            checked={value.includes(opt)}
            onChange={(e) =>
              e.target.checked
                ? onChange([...value, opt])
                : onChange(value.filter((v) => v !== opt))
            }
            style={{ marginRight: 8 }}
          />
          <span style={{ fontSize: 15 }}>{opt}</span>
        </label>
      ))}
    </Space>
  );
}
