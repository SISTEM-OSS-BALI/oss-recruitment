import { Input, Space } from "antd";

interface SearchBarProps {
  onSearch: (value: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  width?: number | string;
}

export default function SearchBar({
  onSearch,
  onChange,
  value,
  width,
}: SearchBarProps) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    onChange?.(e);
    onSearch(e.target.value);
  };

  return (
    <Space direction="horizontal">
      <Input.Search
        placeholder="Search..."
        allowClear
        enterButton="Search"
        onSearch={onSearch}
        onChange={handleChange}
        value={value}
        style={{ width: width || 300 }}
      />
    </Space>
  );
}
