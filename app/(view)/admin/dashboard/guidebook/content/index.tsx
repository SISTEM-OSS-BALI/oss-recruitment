"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Row,
  Col,
  Typography,
  Segmented,
  Space,
  Button,
  Card,
  Tag,
  Divider,
  Anchor,
  Affix,
  List,
  message,
  Empty,
} from "antd";
import {
  ShareAltOutlined,
  DownloadOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

// ————————————————————————————————————————————————
// GuidebookContent — Ant Design edition (no Tailwind)
// • Search, tag filters, sticky TOC, print/share actions
// • Responsive layout: Left TOC (Affix), Main content, Right help panel
// ————————————————————————————————————————————————

export default function GuidebookContent() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("");

  const contentRef = useRef(null);
  const searchRef = useRef(null);
  const activeSectionRef = useRef("");

  const tags = ["All", "General", "Onboarding", "Operations", "Reference"];

  const chapters = useMemo(
    () => [
      {
        id: "overview",
        title: "OSS Recruitment at a Glance",
        summary:
          "Learn who uses the platform, what each menu does, and how the pieces connect.",
        lastUpdated: "2024-12-05",
        estimated: "5 min",
        tags: ["General"],
        sections: [
          {
            heading: "Main Roles",
            content: [
              "SUPER ADMIN prepares the base data: team accounts, document templates, and house rules.",
              "ADMIN runs the daily work: publish jobs, follow up applicants, plan interviews, and send offers.",
              "Candidates use the user portal to apply, upload files, answer questions, and sign the contract.",
            ],
          },
          {
            heading: "Menus You Will See Most",
            content: [
              "Home shows a quick summary of applicants in every stage plus upcoming activities.",
              "Setting Job is used to create or edit job openings.",
              "Recruitment lists applicants per stage (Screening, Interview, Offering, Hiring, Rejected).",
              "Support menus such as Evaluator, Schedule Interview, Template, Procedure Document, History Contract, and Chat help the daily routine.",
            ],
          },
          {
            heading: "Access Levels",
            content: [
              "SUPER ADMIN can see every menu including user and template settings.",
              "ADMIN only sees menus needed for operations so the sidebar stays clean.",
              "If something is missing, contact a SUPER ADMIN to double-check your role.",
            ],
          },
        ],
      },
      {
        id: "initial-setup",
        title: "Before the Recruitment Starts",
        summary:
          "Items to prepare so the entire flow runs smoothly for the team and candidates.",
        lastUpdated: "2024-12-05",
        estimated: "7 min",
        tags: ["Onboarding"],
        sections: [
          {
            heading: "Company Profile",
            content: [
              "Fill in the company basics under Company Setting › Profile (name, HR contact, logo if you have one).",
              "Add office locations so addresses appear on contracts and candidate pages automatically.",
              "Review the details carefully because the same data is used across many modules.",
            ],
          },
          {
            heading: "Team Accounts",
            content: [
              "SUPER ADMIN creates new admins from the User Management menu and assigns the correct role.",
              "Use clear display names or email aliases so conversations are easy to recognize.",
              "Ask every new user to sign in at least once to activate their access.",
            ],
          },
          {
            heading: "Document Templates",
            content: [
              "The Template menu stores contract drafts, referral cards, team ID cards, and onboarding files.",
              "Procedure Document works well for simple SOPs or quick tips you often share with the team.",
              "History Contract keeps every signed document so you can trace approvals later.",
            ],
          },
          {
            heading: "Screening Questions",
            content: [
              "Assignment Setting lets you build question banks for each job type.",
              "Choose between multiple choice or short answer and provide answer choices when needed.",
              "You can also add the MBTI test link here so candidates receive the instruction early.",
            ],
          },
        ],
      },
      {
        id: "job-preparation",
        title: "Publishing a New Job",
        summary:
          "How to use the Setting Job page from draft mode until the vacancy is live.",
        lastUpdated: "2024-12-05",
        estimated: "8 min",
        tags: ["Operations"],
        sections: [
          {
            heading: "Form Steps",
            content: [
              "Step 1 collects basics such as job title, workplace, work arrangement, and salary range.",
              "Step 2 describes the role: summary, core responsibilities, and any important notes for candidates.",
              "Step 3 (optional) links the screening questions or MBTI so applicants get instructions immediately.",
            ],
          },
          {
            heading: "Draft & Publish",
            content: [
              "Drafts save automatically whenever you make changes, so you can leave the page safely.",
              "The top bar shows whether the job is still a draft or already published.",
              "Hit Publish when ready and use the same action to hide the job again later if needed.",
            ],
          },
          {
            heading: "Tracking Applicants per Job",
            content: [
              "Setting Job › Manage Candidates shows the pipeline for that specific vacancy.",
              "Open the applicant card to review files, send chats, or move the stage.",
              "Key figures also appear on the Home dashboard so everyone stays informed.",
            ],
          },
        ],
      },
      {
        id: "candidate-pipeline",
        title: "Handling the Applicant Pipeline",
        summary:
          "Move candidates from screening to hiring while keeping the team aligned.",
        lastUpdated: "2024-12-05",
        estimated: "10 min",
        tags: ["Operations"],
        sections: [
          {
            heading: "Stage Order",
            content: [
              "The main stages are Screening, Interview, Offering, Hiring, and Rejected.",
              "Use the action buttons on the candidate detail page to switch stages after each decision.",
              "Dashboard counters follow the same order so every admin reads the same numbers.",
            ],
          },
          {
            heading: "Reviewing Screening Answers",
            content: [
              "The Screening tab displays all answers so reviewers can read them without downloading files.",
              "MBTI status is visible; resend the link if the candidate has not finished yet.",
              "Update the question sets anytime from Assignment Setting.",
            ],
          },
          {
            heading: "Scheduling Interviews",
            content: [
              "Schedule Interview keeps both on-site and online meetings in one place, complete with time and location.",
              "Evaluator pages record interviewers and their scoring sheets.",
              "Upcoming interviews also appear on the Home dashboard so the team can prepare.",
            ],
          },
          {
            heading: "Making the Offer",
            content: [
              "The Offering tab bundles final salary, benefits, and contract files so you can send everything in one go.",
              "Candidates see the update in their portal, read the contract, sign digitally, or decline with a reason.",
              "Once accepted, the stage moves to Hiring and the signed file stays in History Contract.",
            ],
          },
        ],
      },
      {
        id: "candidate-experience",
        title: "What Candidates Experience",
        summary: "Follow the steps a candidate sees from the first visit to the final decision.",
        lastUpdated: "2024-12-05",
        estimated: "6 min",
        tags: ["General"],
        sections: [
          {
            heading: "Applying for a Job",
            content: [
              "Candidates browse the job list, read the description, and press Apply.",
              "They complete their profile, upload a CV, and answer the screening questions if required.",
              "Partial answers are saved, so they can pause and continue later.",
            ],
          },
          {
            heading: "Tracking Progress",
            content: [
              "The Candidate Progress timeline shows Application, Screening, Interview, Offering, and Hiring.",
              "Each step includes a quick action such as opening the interview schedule or reviewing the contract.",
              "Automatic notifications keep the candidate informed whenever their stage changes.",
            ],
          },
          {
            heading: "Candidate Decisions",
            content: [
              "At the offering stage, candidates accept or decline directly from the portal.",
              "Accepting is as simple as placing a digital signature and uploading the requested ID.",
              "Declining allows them to add a short note so the team understands the situation.",
            ],
          },
        ],
      },
      {
        id: "communication-support",
        title: "Communication & Support",
        summary:
          "Keep the team in sync and know what to do when something feels off.",
        lastUpdated: "2024-12-05",
        estimated: "5 min",
        tags: ["Reference"],
        sections: [
          {
            heading: "Chat & Notifications",
            content: [
              "The Chat menu connects admins with candidates or teammates without leaving the dashboard.",
              "The bell icon in the header lists unread messages; click an item to open that conversation.",
              "Online and typing indicators help everyone feel the conversation is live.",
            ],
          },
          {
            heading: "Reference Documents",
            content: [
              "This Guide Book lives under Settings and offers search plus a handy table of contents.",
              "Procedure Document is perfect for short how-to notes, letter templates, or other frequently shared files.",
              "Tag important chapters as Reference so training sessions can find them quickly.",
            ],
          },
          {
            heading: "If Something Goes Wrong",
            content: [
              "Check your role if a menu disappears unexpectedly.",
              "Refresh the page or sign out and back in whenever data feels slow.",
              "Note the time of the issue and contact a SUPER ADMIN or support if the problem continues.",
            ],
          },
        ],
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chapters.filter((c) => {
      const hitTag = activeTag === "All" || c.tags.includes(activeTag);
      const blocks = [
        c.title,
        c.summary,
        ...(c.sections?.flatMap((s) => [s.heading, ...(s.content || [])]) ||
          []),
      ];
      const hitText = !q ? true : blocks.join(" ").toLowerCase().includes(q);
      return hitTag && hitText;
    });
  }, [chapters, query, activeTag]);

//   const stats = useMemo(() => {
//     const totalChapters = chapters.length;
//     const totalSections = chapters.reduce(
//       (sum, chapter) => sum + (chapter.sections?.length || 0),
//       0
//     );
//     const totalMinutes = chapters.reduce((sum, chapter) => {
//       const match = chapter.estimated.match(/\d+/);
//       return sum + (match ? parseInt(match[0], 10) : 0);
//     }, 0);
//     const avgMinutes = totalChapters
//       ? Math.max(1, Math.round(totalMinutes / totalChapters))
//       : 0;
//     const lastUpdated = chapters.reduce((latest, current) => {
//       const latestDate = latest ? new Date(latest) : null;
//       const currentDate = new Date(current.lastUpdated);
//       if (!latestDate || currentDate > latestDate) {
//         return current.lastUpdated;
//       }
//       return latest;
//     }, "");
//     return {
//       totalChapters,
//       totalSections,
//       avgMinutes,
//       lastUpdated,
//     };
//   }, [chapters]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const pct = Math.min(
        100,
        Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100)
      );
      setProgress(pct);

      if (typeof window === "undefined") {
        return;
      }

      const containerRectTop = el.getBoundingClientRect().top;
      const threshold = 32;
      let currentId = activeSectionRef.current;
      let closestOffset = Number.NEGATIVE_INFINITY;

      filtered.forEach((chapter) => {
        const node = document.getElementById(chapter.id);
        if (!node) return;

        const nodeRectTop = node.getBoundingClientRect().top;
        const offsetTop =
          nodeRectTop - containerRectTop + scrollTop;

        if (offsetTop <= scrollTop + threshold && offsetTop > closestOffset) {
          closestOffset = offsetTop;
          currentId = chapter.id;
        }
      });

      if (currentId !== activeSectionRef.current) {
        activeSectionRef.current = currentId;
        setActiveSection(currentId);
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [filtered]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!filtered.length) {
      activeSectionRef.current = "";
      setActiveSection("");
      return;
    }

    if (!filtered.some((chapter) => chapter.id === activeSectionRef.current)) {
      const firstId = filtered[0].id;
      activeSectionRef.current = firstId;
      setActiveSection(firstId);
    }
  }, [filtered]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Guide Book",
          text: "Check out the official guide.",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        message.success("Link copied to clipboard");
      }
    } catch {
      // ignore
    }
  };

  const handlePrint = () => window.print();

  const handleAnchorClick = (e, link) => {
    e.preventDefault();

    const rawHref = link?.href || "";
    const anchorId = rawHref.startsWith("#")
      ? rawHref.slice(1)
      : rawHref.split("#")[1];

    if (!anchorId) return;

    const container = contentRef.current;
    const target =
      typeof document !== "undefined"
        ? document.getElementById(anchorId)
        : null;

    if (!target) return;

    if (container) {
      const containerRectTop = container.getBoundingClientRect().top;
      const targetRectTop = target.getBoundingClientRect().top;
      const offsetTop =
        targetRectTop - containerRectTop + container.scrollTop - 12;

      container.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    activeSectionRef.current = anchorId;
    setActiveSection(anchorId);
  };

  const anchorItems = filtered.map((c) => ({
    key: c.id,
    href: `#${c.id}`,
    title: c.title,
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #eef3ff 0%, #ffffff 45%)",
      }}
    >
      {/* <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9,
          background: "#fff",
          padding: "4px 12px",
          borderBottom: "1px solid #f0f0f0",
          boxShadow: progress > 0 ? "0 6px 12px rgba(15,23,42,0.04)" : "none",
        }}
      >
        <Progress percent={progress} showInfo={false} size="small" />
      </div> */}

      <div
        style={{
          padding: "32px 24px 48px",
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        <Card
          bordered={false}
          style={{
            borderRadius: 20,
            background:
              "linear-gradient(135deg, rgba(31,60,136,1) 0%, rgba(98,68,245,1) 55%, rgba(138,114,249,1) 100%)",
            color: "#fff",
            boxShadow: "0 24px 60px rgba(31,60,136,0.35)",
          }}
          bodyStyle={{ padding: 32 }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={14}>
              <Space direction="vertical" size={16}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.75)",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Official Playbook
                </Text>
                <Title level={2} style={{ color: "#fff", margin: 0 }}>
                  Guide Book
                </Title>
                <Paragraph
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    margin: 0,
                  }}
                >
                  Navigate onboarding, configuration, and day-to-day operations with a curated,
                  always up-to-date reference. Designed for fast adoption and long-term success.
                </Paragraph>
                <Space size={[8, 8]} wrap>
                  {["Structured chapters", "Expert tips", "Download-ready"].map((item) => (
                    <Tag
                      key={item}
                      style={{
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.4)",
                        background: "rgba(255,255,255,0.08)",
                        borderRadius: 999,
                        padding: "2px 10px",
                      }}
                    >
                      {item}
                    </Tag>
                  ))}
                </Space>
                <Space>
                  <Button
                    type="primary"
                    ghost
                    icon={<ShareAltOutlined />}
                    onClick={handleShare}
                  >
                    Share
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handlePrint}
                    style={{
                      background: "#fff",
                      color: "#1f3c88",
                      borderRadius: 6,
                      border: "none",
                      fontWeight: 600,
                    }}
                  >
                    Download PDF
                  </Button>
                </Space>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                background: "#ffffff",
                boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Statistic
                title="Chapters"
                value={stats.totalChapters}
                valueStyle={{ color: "#1f3c88", fontWeight: 600 }}
              />
              <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                Coverage from introductions to advanced operations.
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                background: "#ffffff",
                boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
              }}
              bodyStyle={{ padding: 24 }}
            >
              <Statistic
                title="Total sections"
                value={stats.totalSections}
                valueStyle={{ color: "#1f3c88", fontWeight: 600 }}
              />
              <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                Detailed walkthroughs for every critical scenario.
              </Text>
            </Card>
          </Col>
        </Row> */}

        <Card
          bordered={false}
          style={{
            marginTop: 24,
            borderRadius: 18,
            background: "#ffffff",
            boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
          }}
          bodyStyle={{ padding: 24 }}
        >
          <Row gutter={[16, 16]} align="middle">
            {/* <Col xs={24} md={16}>
              <Input
                ref={searchRef}
                size="large"
                allowClear
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, features, or terms… (press / to focus)"
                prefix={<SearchOutlined />}
              />
            </Col> */}
            <Col xs={24} md={24}>
              <Segmented
                block
                options={tags}
                value={activeTag}
                onChange={(v) => setActiveTag(v)}
                style={{ background: "#f1f4ff", borderRadius: 999 }}
              />
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 24]} style={{ marginTop: 32 }}>
          <Col xs={24} xl={5}>
            <Affix offsetTop={120}>
              <Card
                size="small"
                bordered={false}
                title={<span style={{ fontWeight: 600 }}>Table of Contents</span>}
                style={{
                  borderRadius: 16,
                  background: "#ffffff",
                  boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
                }}
                bodyStyle={{ padding: 16 }}
              >
                {anchorItems.length ? (
                  <Anchor
                    items={anchorItems}
                    replace
                    affix={false}
                    onClick={handleAnchorClick}
                    activeKey={activeSection || undefined}
                    getContainer={() => {
                      if (contentRef.current) return contentRef.current;
                      if (typeof window !== "undefined") {
                        return document.body;
                      }
                      return undefined;
                    }}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No items"
                  />
                )}
              </Card>
            </Affix>
          </Col>

          <Col xs={24} xl={14}>
            <Card
              bordered={false}
              style={{
                borderRadius: 20,
                background: "#ffffff",
                boxShadow: "0 20px 56px rgba(15,23,42,0.12)",
              }}
              bodyStyle={{ padding: 0 }}
            >
              <div
                ref={contentRef}
                id="guidebook-scroll-container"
                style={{
                  maxHeight: "calc(100vh - 260px)",
                  overflow: "auto",
                  padding: 24,
                }}
              >
                {filtered.length === 0 ? (
                  <div style={{ padding: "32px 0" }}>
                    <Empty description="No results for the current keyword/filters" />
                  </div>
                ) : (
                  filtered.map((c) => (
                    <Card
                      key={c.id}
                      id={c.id}
                      hoverable
                      style={{
                        marginBottom: 20,
                        borderRadius: 18,
                        border: "1px solid #eef2ff",
                        background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)",
                        boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
                      }}
                      bodyStyle={{ padding: 24 }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col flex="auto">
                          <Title level={4} style={{ marginBottom: 4 }}>
                            {c.title}
                          </Title>
                          <Text type="secondary">{c.summary}</Text>
                        </Col>
                      </Row>

                      <Space size={[8, 8]} wrap style={{ marginTop: 12 }}>
                        {c.tags.map((t) => (
                          <Tag
                            key={t}
                            color="blue"
                            style={{ borderRadius: 999, padding: "0 12px" }}
                          >
                            {t}
                          </Tag>
                        ))}
                      </Space>

                      <Divider
                        style={{ margin: "16px 0", borderBlockStart: "1px solid #edf1ff" }}
                      />

                      {c.sections?.map((s, idx) => (
                        <div key={idx} style={{ marginBottom: 16 }}>
                          <Title level={5} style={{ marginBottom: 8 }}>
                            {s.heading}
                          </Title>
                          <List
                            size="small"
                            split={false}
                            dataSource={s.content || []}
                            renderItem={(item) => (
                              <List.Item style={{ padding: "6px 0", border: "none" }}>
                                <Space align="start" size={12}>
                                  <CheckCircleFilled
                                    style={{ color: "#2b74ff", marginTop: 4, fontSize: 12 }}
                                  />
                                  <Text>{item}</Text>
                                </Space>
                              </List.Item>
                            )}
                          />
                        </div>
                      ))}

                      <Divider
                        style={{ margin: "16px 0", borderBlockStart: "1px solid #edf1ff" }}
                      />
                      {/* <Button
                        type="link"
                        icon={<ArrowUpOutlined />}
                        onClick={() =>
                          contentRef.current?.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          })
                        }
                        style={{ paddingLeft: 0 }}
                      >
                        Back to top
                      </Button> */}
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} xl={5}>
            <Affix offsetTop={120}>
              <Space direction="vertical" size="large" style={{ display: "flex" }}>
                <Card
                  size="small"
                  bordered={false}
                  title={<span style={{ fontWeight: 600 }}>Document Status</span>}
                  style={{
                    borderRadius: 16,
                    background: "#ffffff",
                    boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <Space size={12} wrap>
                    <Tag color="success" style={{ borderRadius: 999, padding: "0 12px" }}>
                      Stable
                    </Tag>
                    <Text type="secondary">Maintained by Ops Excellence</Text>
                  </Space>
                  <Paragraph type="secondary" style={{ marginTop: 12 }}>
                    The team reviews updates every sprint and aligns with compliance requirements.
                  </Paragraph>
                </Card>

                <Card
                  size="small"
                  bordered={false}
                  title={<span style={{ fontWeight: 600 }}>Need Help?</span>}
                  style={{
                    borderRadius: 16,
                    background: "#ffffff",
                    boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <List
                    size="small"
                    split={false}
                    dataSource={[
                      "Help Center",
                      "Security & Compliance",
                      "Contact Administrator",
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ padding: "6px 0", border: "none" }}>
                        <a href="#">{item}</a>
                      </List.Item>
                    )}
                  />
                </Card>

                <Card
                  size="small"
                  bordered={false}
                  title={<span style={{ fontWeight: 600 }}>Quick Notes</span>}
                  style={{
                    borderRadius: 16,
                    background: "#ffffff",
                    boxShadow: "0 16px 48px rgba(15,23,42,0.08)",
                  }}
                  bodyStyle={{ padding: 16 }}
                >
                  <List
                    size="small"
                    split={false}
                    dataSource={[
                      "Save a PDF snapshot for annual audits.",
                      "Use the TOC for quick navigation.",
                      "Update the FAQ when new patterns emerge.",
                    ]}
                    renderItem={(item) => (
                      <List.Item style={{ padding: "6px 0", border: "none" }}>
                        {item}
                      </List.Item>
                    )}
                  />
                </Card>
              </Space>
            </Affix>
          </Col>
        </Row>
      </div>
    </div>
  );
}

function formatDateEN(iso) {
  try {
    const d = new Date(iso);
    const f = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
    return f;
  } catch {
    return iso;
  }
}
