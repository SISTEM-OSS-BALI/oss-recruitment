"use client";


import { toCapitalized } from "@/app/utils/capitalized";
import { RightOutlined } from "@ant-design/icons";
import { Breadcrumb } from "antd";
import { usePathname, useRouter } from "next/navigation";


export const MainBreadcrumb = () => {
  const pathname = usePathname();
  const router = useRouter();

  const pathnameList = pathname.split("/").filter((item) => item);

  const breadcrumbItems = [
    {
      title: (
        <span style={{ cursor: "pointer" }} onClick={() => router.push("/")}>
          Home
        </span>
      ),
    },
    ...pathnameList.map((item, index) => {
      const isLast = index === pathnameList.length - 1;
      const path = "/" + pathnameList.slice(0, index + 1).join("/");

      return {
        title: isLast ? (
          toCapitalized(item)
        ) : (
          <span style={{ cursor: "pointer" }} onClick={() => router.push(path)}>
            {toCapitalized(item)}
          </span>
        ),
      };
    }),
  ];

  return (
    <Breadcrumb
      style={{ fontSize: 14 }}
      items={breadcrumbItems}
      separator={<RightOutlined style={{ fontSize: 12, color: "#bdbdbd" }} />}
    />
  );
};
