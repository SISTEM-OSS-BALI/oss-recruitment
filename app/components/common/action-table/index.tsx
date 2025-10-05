import React from "react";
import { Flex, Tooltip } from "antd";
import type { CSSProperties, ReactNode } from "react";
import ModalConfirm from "../modal-confirm";

/** Deskriptor satu action */
export type ActionItem = {
  key: string;
  icon: ReactNode;
  tooltip?: string;
  /** Klik akan dipanggil dengan id baris */
  onClick?: (id: string) => void;
  /** Konfirmasi opsional */
  confirm?: {
    title: string;
    description: string;
    okText?: string;
    cancelText?: string;
    danger?: boolean;
  };
  /** Sembunyikan aksi secara kondisional */
  visible?: boolean;
  /** Style untuk badge/ tombol mini */
  style?: CSSProperties;
  /** Nonaktifkan klik */
  disabled?: boolean;
};

type Props = {
  id: string;

  /** PROPS BARU: daftar action yang akan dirender */
  items?: ActionItem[];

  /** PROPS LAMA (legacy): tetap didukung untuk backward compatibility */
  actions?: ActionItem[];

  /** style default badge action */
  badgeStyle?: CSSProperties;

  /** saat tidak ada action, render apa? (default: null) */
  emptyFallback?: React.ReactNode;
};

export default function ActionTable({
  id,
  items,
  actions,
  badgeStyle = {
    backgroundColor: "#1677ff",
    padding: 8,
    borderRadius: 8,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    cursor: "pointer",
  },
  emptyFallback = null,
}: Props) {
  // Normalisasi: pakai items kalau ada, fallback ke actions, lalu ke [].
  const rawList = Array.isArray(items)
    ? items
    : Array.isArray(actions)
    ? actions
    : [];

  const list: ActionItem[] = rawList.filter((a) => a && a.visible !== false);

  if (list.length === 0) return <>{emptyFallback}</>;

  return (
    <div>
      <Flex gap={8}>
        {list.map((action) => {
          const handleClick = () => {
            if (action.disabled) return;
            if (action.confirm) {
              ModalConfirm({
                title: action.confirm.title,
                description: action.confirm.description,
                actions: action.confirm.okText ?? "OK",
                onOk: () => action.onClick?.(id),
              });
            } else {
              action.onClick?.(id);
            }
          };

          return (
            <Tooltip key={action.key} title={action.tooltip}>
              <span
                role="button"
                aria-disabled={action.disabled}
                style={{
                  ...badgeStyle,
                  ...(action.disabled
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : null),
                  ...action.style,
                }}
                onClick={handleClick}
              >
                {action.icon}
              </span>
            </Tooltip>
          );
        })}
      </Flex>
    </div>
  );
}
