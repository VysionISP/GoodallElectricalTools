import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      businessId: string;
      role: "OWNER" | "ADMIN" | "TECHNICIAN";
    } & DefaultSession["user"];
  }

  interface User {
    businessId: string;
    role: "OWNER" | "ADMIN" | "TECHNICIAN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    businessId: string;
    role: "OWNER" | "ADMIN" | "TECHNICIAN";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    businessId: string;
    role: "OWNER" | "ADMIN" | "TECHNICIAN";
  }
}
