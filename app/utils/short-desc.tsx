import { useState } from "react";
import { Button, Modal } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { sanitizeHtml } from "./sanitize-html";

function ShortDescWithDetail({ value }: { value: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div>
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setOpen(true)}
        >
          See Detail
        </Button>
      </div>
      <Modal
        open={open}
        title="Description"
        onCancel={() => setOpen(false)}
        footer={null}
        width={600}
      >
        <div
          style={{ whiteSpace: "pre-line" }}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }}
        />
      </Modal>
    </>
  );
}

export default ShortDescWithDetail;
