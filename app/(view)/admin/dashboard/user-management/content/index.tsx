"use client";

import { useUsers } from "@/app/hooks/user";
import { map } from "lodash";

export default function UserManagementContent() {
  const { data } = useUsers({});

  return (
    <div>
      {map(data, (user) => (
        <div key={user.id}>
          <h3>
            {user.name} ({user.email})
          </h3>
          <p>Role: {user.role}</p>
        </div>
      ))}
    </div>
  );
}
