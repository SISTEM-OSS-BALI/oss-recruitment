import { FilePdfOutlined } from "@ant-design/icons";
import { Empty, Space } from "antd";

export function PDFViewer({ src }: { src?: string | null }) {
  if (!src) {
    return (
      <div
        style={{
          height: 560,
          display: "grid",
          placeItems: "center",
          border: "1px solid #f0f0f0",
          borderRadius: 12,
          background: "#fafafa",
        }}
      >
        <Empty
          description={
            <Space>
              <FilePdfOutlined />
              <span>No file</span>
            </Space>
          }
        />
      </div>
    );
  }
  // pakai <iframe> untuk preview cepat
  return (
    <iframe
      src={src}
      style={{
        width: "100%",
        height: 650,
        border: "1px solid #f0f0f0",
        borderRadius: 12,
      }}
    />
  );
}
