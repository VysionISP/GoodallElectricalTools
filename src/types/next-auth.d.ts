import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      businessId: string;
      role: "OWNER" | "ADMIN" | "TECHNICIAN";
      isPlatformAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    businessId: string;
    role: "OWNER" | "ADMIN" | "TECHNICIAN";
    isPlatformAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    businessId: string;
    role: "OWNER" | "ADMIN" | "TECHNICIAN";
    isPlatformAdmin: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    businessId: string;
    role: "OWNER" | "ADMIN" | "TECHNICIAN";
    isPlatformAdmin: boolean;
  }
}
