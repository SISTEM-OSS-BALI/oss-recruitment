"use client";

import { useJobs } from "@/app/hooks/job";
import { useState } from "react";
import { Row, Col, Typography, Input, Button } from "antd";
import { sanitizeHtml } from "@/app/utils/sanitize-html";
import FilterSidebar from "@/app/components/common/sidebar/user/filter-sidebar-job";
import JobCard from "@/app/components/common/card/user/job";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function JobList() {
  const { data: jobData } = useJobs({});
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [client, setClient] = useState<string[]>([]);
  const [department, setDepartment] = useState<string[]>([]);
  const [position, setPosition] = useState<string[]>([]);

  const clearFilters = () => {
    setStatus([]);
    setClient([]);
    setDepartment([]);
    setPosition([]);
    setSearch("");
  };

  // Filter logic
  const filteredJobs =
    jobData?.filter((job) => {
      // Status
      const statusMatch =
        status.length === 0 ||
        status.includes(
          dayjs(job.until_at).diff(dayjs(), "hour") > 0 ? "Open" : "Closed"
        );
      // Client
      const clientMatch =
        client.length === 0 ||
        client.some((c) =>
          sanitizeHtml(job.description).toLowerCase().includes(c.toLowerCase())
        );
      // Department
      const departmentMatch =
        department.length === 0 ||
        department.some((d) =>
          sanitizeHtml(job.description).toLowerCase().includes(d.toLowerCase())
        );
      // Position
      const positionMatch =
        position.length === 0 ||
        position.some((p) =>
          sanitizeHtml(job.description).toLowerCase().includes(p.toLowerCase())
        );
      // Search
      const searchMatch =
        search.trim() === "" ||
        job.name.toLowerCase().includes(search.toLowerCase()) ||
        sanitizeHtml(job.description)
          .toLowerCase()
          .includes(search.toLowerCase());
      return (
        statusMatch &&
        clientMatch &&
        departmentMatch &&
        positionMatch &&
        searchMatch
      );
    }) || [];

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 16px" }}>
      {/* JUDUL & SEARCH */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 36,
          marginTop: 10,
        }}
      >
        <Title
          level={3}
          style={{ fontWeight: 700, marginBottom: 0, textAlign: "center" }}
        >
          Available Job Positions
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: 20, textAlign: "center", marginTop: 6 }}
        >
          Find jobs and internships <br />
          that suits your needs
        </Text>
        <div
          style={{
            marginTop: 30,
            width: "100%",
            maxWidth: 620,
            display: "flex",
            gap: 18,
          }}
        >
          <Input
            size="large"
            placeholder="Explore available positions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{
              borderRadius: 12,
              background: "#f8fafc",
              fontSize: 17,
              borderColor: "#e6eeff",
              flex: 1,
            }}
          />
          <Button
            type="primary"
            size="large"
            style={{
              borderRadius: 12,
              fontWeight: 600,
              padding: "0 34px",
              fontSize: 17,
              height: 48,
            }}
          >
            Search
          </Button>
        </div>
      </div>

      {/* KONTEN GRID */}
      <Row gutter={32} align="top">
        {/* FILTER SIDEBAR */}
        <Col
          xs={24}
          sm={7}
          md={7}
          lg={6}
          xl={5}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <FilterSidebar
            status={status}
            setStatus={setStatus}
            client={client}
            setClient={setClient}
            department={department}
            setDepartment={setDepartment}
            position={position}
            setPosition={setPosition}
            clearFilters={clearFilters}
          />
        </Col>
        {/* JOB LIST */}
        <Col xs={24} sm={17} md={17} lg={18} xl={19}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {filteredJobs.length === 0 && (
              <Text
                type="secondary"
                style={{ fontSize: 17, textAlign: "center" }}
              >
                No jobs found.
              </Text>
            )}
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}
