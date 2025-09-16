/* eslint-disable @typescript-eslint/no-unused-vars */
// types/next-auth.d.ts
import { Role } from "@prisma/client";
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT extends Record<string, unknown> {
    id: string;
    name: string;
    email: string;
    role: Role
  }
}
