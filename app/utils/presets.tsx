// presets.ts
import React from "react";
import { Flex, Tooltip } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { CalendarOutlined, DeleteFilled, EditFilled, MessageFilled } from "@ant-design/icons";
import ModalConfirm from "../components/common/modal-confirm";

/** Preset yang tersedia */
export type ActionPresetType = "default" | "schedule-evaluator" | "chat";

/** Konteks yang diteruskan ke handler; bisa kamu perluas */
export type ActionContext = {
  /** primary key baris; digunakan oleh ActionTable untuk meneruskan ke onClick */
  id: string;
  /** apapun yang ingin kamu bawa (misal status row, role, dll) */
  meta?: Record<string, unknown>;
};

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
  const list: ActionItem[] = (items ?? actions ?? []).filter(
    (a) => a && a.visible !== false
  );

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

/** Opsi umum untuk seluruh preset */
type PresetOptions = {
  /** i18n label confirm delete */
  confirmDelete: {
    title: string;
    description: string;
    okText?: string;
  };
  /** permission/visibility dasar */
  canEdit?: boolean;
  canDelete?: boolean;
  /** tombol edit/delete override style */
  editStyle?: React.CSSProperties;
  deleteStyle?: React.CSSProperties;
};

/** Handler per aksi */
type PresetHandlers = {
  onEdit: (id: string, ctx?: ActionContext) => void;
  onDelete: (id: string, ctx?: ActionContext) => void;
  onClick?: (id: string, ctx?: ActionContext) => void; // untuk schedule-evaluator
  onChat?: (applicant_id: string) => void; // ✅ CHAT handler
};

/** Input utama factory */
type MakeActionsInput = PresetHandlers &
  PresetOptions & {
    type: ActionPresetType;
    /** context opsional yang akan diteruskan ke semua handler */
    context?: ActionContext;
  };

/** Aksi dasar yang sering muncul di semua preset */
const buildBaseActions = ({
  onEdit,
  onDelete,
  confirmDelete,
  canEdit = true,
  canDelete = true,
  editStyle,
  deleteStyle,
  context,
}: PresetHandlers &
  PresetOptions & { context?: ActionContext }): ActionItem[] => {
  const base: ActionItem[] = [];

  if (canEdit) {
    base.push({
      key: "edit",
      icon: <EditFilled />,
      tooltip: "Edit",
      style: {
        backgroundColor: "#1677ff",
        ...editStyle,
      },
      onClick: (id) => onEdit(id, context),
    });
  }

  if (canDelete) {
    base.push({
      key: "delete",
      icon: <DeleteFilled />,
      tooltip: "Delete",
      style: {
        backgroundColor: "#d93025",
        ...deleteStyle,
      },
      confirm: {
        title: confirmDelete.title,
        description: confirmDelete.description,
        okText: confirmDelete.okText ?? "Delete",
        danger: true,
      },
      onClick: (id) => onDelete(id, context),
    });
  }

  return base;
};

/** Aksi spesifik per preset */
const buildPreset = ({
  type,
  onClick,
  onChat,
  context,
}: Pick<
  MakeActionsInput,
  "type" | "onClick" | "onChat" | "context"
>): ActionItem[] => {
  switch (type) {
    case "schedule-evaluator":
      return [
        {
          key: "schedule",
          icon: <CalendarOutlined />,
          tooltip: "Schedule",
          onClick: (id) => onClick?.(id, context),
        },
      ];

    case "chat":
      return [
        {
          key: "chat",
          icon: <MessageFilled />,
          tooltip: "Chat",
          // ✅ sekarang meneruskan id & context ke handler
          onClick: (applicant_id) => onChat?.(applicant_id),
        },
      ];

    case "default":
    default:
      return [];
  }
};

/** Factory utama: gabungkan base + preset */
export const makeActionsByType = (input: MakeActionsInput): ActionItem[] => {
  const {
    type,
    onEdit,
    onDelete,
    onClick,
    onChat,
    confirmDelete,
    canEdit,
    canDelete,
    editStyle,
    deleteStyle,
    context,
  } = input;

  const base = buildBaseActions({
    onEdit,
    onDelete,
    confirmDelete,
    canEdit,
    canDelete,
    editStyle,
    deleteStyle,
    context,
  });

  const extra = buildPreset({ type, onClick, onChat, context });

  return [...base, ...extra];
};
