import { useLocations } from "@/app/hooks/location";
import { JobDataModel } from "@/app/models/job";
import {
  Alert,
  Button,
  Checkbox,
  DatePicker,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select,
  Segmented,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import ReactQuill from "react-quill";

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
      const salaryNumeric = initialValues.salary
        ? Number(initialValues.salary.toString().replace(/[^\d]/g, ""))
        : undefined;

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
        salary:
          nextType === "REFFERAL" || Number.isNaN(salaryNumeric)
            ? undefined
            : salaryNumeric,
        type_job: nextType,
        show_salary:
          nextType === "REFFERAL" ? false : Boolean(initialValues.show_salary),
        work_type: initialValues.work_type ?? WORK_TYPE_OPTIONS[0],
        employment: initialValues.employment ?? EMPLOYMENT_TYPE_OPTIONS[0],
        until_at: initialValues.until_at
          ? dayjs(initialValues.until_at)
          : undefined,
      });
    } else {
      setSelectedType(TYPE_JOB_OPTIONS[0]);
      form.setFieldsValue({
        type_job: TYPE_JOB_OPTIONS[0],
        work_type: WORK_TYPE_OPTIONS[0],
        employment: EMPLOYMENT_TYPE_OPTIONS[0],
        show_salary: true,
      });
    }
  }, [open, type, initialValues, form]);

  useEffect(() => {
    if (!open) return;
    form.setFieldValue("type_job", selectedType);

    if (selectedType === "REFFERAL") {
      form.setFieldsValue({
        salary: undefined,
        show_salary: false,
        work_type: WORK_TYPE_OPTIONS[0],
        employment: EMPLOYMENT_TYPE_OPTIONS[0],
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
        name="name"
        label="Name Job"
        rules={[{ required: true, message: "Name Job is required" }]}
      >
        <Input placeholder="Add Name Job" size="large" />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Description is required" }]}
      >
        <ReactQuill placeholder="Add Description" theme="snow" />
      </Form.Item>
      {selectedType === "TEAM_MEMBER" ? (
        <>
          <Form.Item
            name="salary"
            label="Salary"
            rules={[{ required: true, message: "Salary is required" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              formatter={(value) =>
                value ? `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ""
              }
              parser={(value) => value?.replace(/[Rp.\s]/g, "") ?? ""}
              placeholder="Enter salary amount"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="show_salary"
            valuePropName="checked"
            tooltip="Enable this to display salary information on the job listing."
          >
            <Checkbox>Show salary in job listing</Checkbox>
          </Form.Item>
          <Form.Item
            name="work_type"
            label="Work Type"
            rules={[{ required: true, message: "Work type is required" }]}
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
            name="employment"
            label="Employment Type"
            rules={[{ required: true, message: "Employment type is required" }]}
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
          <Form.Item name="work_type" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="employment" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="salary" hidden>
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
