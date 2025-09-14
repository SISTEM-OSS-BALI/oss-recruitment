"use client";

import { List, Avatar, Space, Tag, Dropdown, Button, Image } from "antd";
import { MoreOutlined, DragOutlined } from "@ant-design/icons";
import { CSSProperties, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { DND_ITEM, DragItem } from "./types";
import getInitials from "./username-helper";


type Props = {
  id: string;
  name: string;
  email: string;
  status: string;
  active: boolean;
  image_url?: string | null;
  onClick: () => void;
  visibleIndex: number;
  onHoverMove: (dragId: string, overId: string) => void;
};

export default function DraggableCandidateItem({
  id,
  name,
  email,
  image_url,
  status,
  active,
  onClick,
  visibleIndex,
  onHoverMove,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag({
    type: DND_ITEM.CANDIDATE,
    item: (): DragItem => ({ type: DND_ITEM.CANDIDATE, id, visibleIndex }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop<DragItem>({
    accept: DND_ITEM.CANDIDATE,
    hover: (dragItem, monitor) => {
      if (!ref.current) return;
      const dragId = dragItem.id;
      const overId = id;
      if (dragId === overId) return;

      // gunakan posisi pointer untuk hanya trigger move saat melewati setengah elemen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Seret ke bawah: hanya saat melewati paruh bawah
      if (dragItem.visibleIndex < visibleIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      // Seret ke atas: hanya saat melewati paruh atas
      if (dragItem.visibleIndex > visibleIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onHoverMove(dragId, overId);
      // update index agar animasi/hover berikutnya akurat
      dragItem.visibleIndex = visibleIndex;
    },
  });

  drag(drop(ref));

  const style: CSSProperties = {
    border: "1px solid",
    borderColor: active ? "#2370ff" : "#f0f0f0",
    background: active ? "#f5f9ff" : "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    cursor: "grab",
    transition: "0.2s",
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={ref} style={style}>
      <List.Item
        onClick={onClick}
        actions={[
          <Dropdown
            key="more"
            menu={{
              items: [
                { key: "view", label: "View Profile" },
                { key: "timeline", label: "View Timeline" },
                { key: "message", label: "Send Message" },
              ],
            }}
            trigger={["click"]}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>,
          // drag handle visual
          <DragOutlined
            key="drag"
            style={{ fontSize: 18, color: "#bfbfbf" }}
          />,
        ]}
      >
        <List.Item.Meta
          avatar={
            <Avatar
              size={40}
              style={{ background: "#e6f0ff", color: "#2458e6" }}
            >
              {image_url ? <Image src={image_url} /> : getInitials(name)}
            </Avatar>
          }
          title={<span style={{ fontWeight: 600 }}>{name}</span>}
          description={
            <Space size={8} wrap>
              <Tag>{status}</Tag>
              <span style={{ color: "#999", fontSize: 12 }}>{email}</span>
            </Space>
          }
        />
      </List.Item>
    </div>
  );
}
