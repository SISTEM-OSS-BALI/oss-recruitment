"use client";

import { useLocations } from "@/app/hooks/location";
import { JobDataModel } from "@/app/models/job";
import {
  formatCurrencyIDR,
  parseCurrencyToNumber,
} from "@/app/utils/currency";
import {
  Alert,
  Button,
  Checkbox,
  Col,
  DatePicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Row,
  Select,
  Segmented,
} from "antd";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const WORK_TYPE_OPTIONS = ["ONSITE", "HYBRID", "REMOTE"] as const;
const EMPLOYMENT_TYPE_OPTIONS = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
] as const;
const TYPE_JOB_OPTIONS = ["TEAM_MEMBER", "REFFERAL"] as const;

export default function JobForm({
  form,
  onFinish,
  loadingCreate,
  loadingUpdate,
  type,
  initialValues,
  open,
}: {
  onFinish: (values: JobDataModel) => Promise<void>;
  loadingCreate: boolean;
  loadingUpdate: boolean;
  initialValues?: JobDataModel;
  form: FormInstance<JobDataModel>;
  type: "create" | "update";
  open: boolean;
}) {
  const [selectedType, setSelectedType] = useState<
    (typeof TYPE_JOB_OPTIONS)[number]
  >(TYPE_JOB_OPTIONS[0]);

  useEffect(() => {
    if (!open) return; // only when modal is open
    form.resetFields();

    if (type === "update" && initialValues) {
      const nextType =
        initialValues.type_job &&
        TYPE_JOB_OPTIONS.includes(
          initialValues.type_job as (typeof TYPE_JOB_OPTIONS)[number]
        )
          ? (initialValues.type_job as (typeof TYPE_JOB_OPTIONS)[number])
          : TYPE_JOB_OPTIONS[0];

      setSelectedType(nextType);

      form.setFieldsValue({
        ...initialValues,
        type_job: nextType,
        show_salary:
          nextType === "REFFERAL" ? false : Boolean(initialValues.show_salary),
        arrangement:
          nextType === "REFFERAL"
            ? WORK_TYPE_OPTIONS[0]
            : initialValues.arrangement ?? WORK_TYPE_OPTIONS[0],
        commitment:
          nextType === "REFFERAL"
            ? EMPLOYMENT_TYPE_OPTIONS[0]
            : initialValues.commitment ?? EMPLOYMENT_TYPE_OPTIONS[0],
        salary_min:
          nextType === "REFFERAL" ? undefined : initialValues.salary_min,
        salary_max:
          nextType === "REFFERAL" ? undefined : initialValues.salary_max,
        until_at: initialValues.until_at
          ? dayjs(initialValues.until_at)
          : undefined,
      });
    } else {
      const defaultType = TYPE_JOB_OPTIONS[0];
      setSelectedType(defaultType);
      form.setFieldsValue({
        type_job: defaultType,
        arrangement: WORK_TYPE_OPTIONS[0],
        commitment: EMPLOYMENT_TYPE_OPTIONS[0],
        show_salary: true,
      });
    }
  }, [open, type, initialValues, form]);

  useEffect(() => {
    if (!open) return;
    form.setFieldValue("type_job", selectedType);

    if (selectedType === "REFFERAL") {
      form.setFieldsValue({
        salary_min: undefined,
        salary_max: undefined,
        show_salary: false,
        arrangement: WORK_TYPE_OPTIONS[0],
        commitment: EMPLOYMENT_TYPE_OPTIONS[0],
      });
    } else if (form.getFieldValue("show_salary") === undefined) {
      form.setFieldValue("show_salary", true);
    }
  }, [selectedType, open, form]);

  const { data: locations } = useLocations({});
  return (
    <Form
      layout="vertical"
      onFinish={onFinish}
      form={form}
    >
      <Form.Item name="type_job" hidden>
        <Input />
      </Form.Item>

      <Form.Item label="Job Type" required>
        <Segmented
          options={[
            { label: "Team Member", value: "TEAM_MEMBER" },
            { label: "Referral", value: "REFFERAL" },
          ]}
          value={selectedType}
          onChange={(value) =>
            typeof value === "string" &&
            setSelectedType(value as (typeof TYPE_JOB_OPTIONS)[number])
          }
          block
        />
      </Form.Item>

      {selectedType === "REFFERAL" && (
        <Alert
          message="Referral job"
          description="Use this type to receive referral submissions. The reward amount will be shown instead of salary."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Form.Item
        name="job_title"
        label="Job Title"
        rules={[{ required: true, message: "Job title is required" }]}
      >
        <Input placeholder="Add job title" size="large" />
      </Form.Item>
      <Form.Item
        name="job_role"
        label="Job Role"
        rules={[{ required: true, message: "Job role is required" }]}
      >
        <Input placeholder="Add job role" size="large" />
      </Form.Item>
      <Form.Item
        name="description"
        label="Job Summary"
        rules={[{ required: true, message: "Job summary is required" }]}
      >
        <ReactQuill placeholder="Add Description" theme="snow" />
      </Form.Item>
      {selectedType === "TEAM_MEMBER" ? (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="salary_min"
                label="Minimum Salary"
                rules={[{ required: true, message: "Minimum salary is required" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0 as number}
                  formatter={(value) => formatCurrencyIDR(value)}
                  parser={(value) => parseCurrencyToNumber(value) ?? 0}
                  placeholder="Enter minimum salary"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="salary_max"
                label="Maximum Salary"
                rules={[{ required: true, message: "Maximum salary is required" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0 as number}
                  formatter={(value) => formatCurrencyIDR(value)}
                  parser={(value) => parseCurrencyToNumber(value) ?? 0}
                  placeholder="Enter maximum salary"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="show_salary"
            valuePropName="checked"
            tooltip="Enable this to display salary information on the job listing."
          >
            <Checkbox>Show salary in job listing</Checkbox>
          </Form.Item>
          <Form.Item
            name="arrangement"
            label="Work Arrangement"
            rules={[{ required: true, message: "Work arrangement is required" }]}
          >
            <Select placeholder="Select work arrangement" size="large">
              {WORK_TYPE_OPTIONS.map((type) => (
                <Select.Option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="commitment"
            label="Commitment Type"
            rules={[{ required: true, message: "Commitment type is required" }]}
          >
            <Select placeholder="Select employment type" size="large">
              {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
                <Select.Option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </>
      ) : (
        <>
          <Form.Item name="show_salary" hidden valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item name="arrangement" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="commitment" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="salary_min" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="salary_max" hidden>
            <Input />
          </Form.Item>
        </>
      )}
      <Form.Item
        label="Until At"
        name="until_at"
        rules={[{ required: true, message: "Date is required" }]}
      >
        <DatePicker
          style={{ width: "100%" }}
          format="DD MMMM YYYY"
          placeholder="Select Date"
          size="large"
        />
      </Form.Item>
      <Form.Item
        name="location_id"
        label="Location"
        rules={[{ required: true, message: "Location is required" }]}
      >
        <Select size="large">
          {locations?.map((location) => (
            <Select.Option key={location.id} value={location.id}>
              {location.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item name="is_published" valuePropName="checked">
        <Checkbox>
          Publish{" "}
          <span
            style={{
              fontStyle: "italic",
              color: "#888",
            }}
          >
            * If checked, the job will be visible to candidates
          </span>
        </Checkbox>
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={type === "create" ? loadingCreate : loadingUpdate}
          size="large"
          style={{
            width: "100%",
            backgroundColor: "#C30010",
            borderColor: "#C30010",
          }}
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
