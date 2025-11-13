import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    nickName?: string;
    id?: string;
    email?: string;
  }

  interface Session extends DefaultSession {
    access_token?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    access_token?: string;
    refresh_token?: string;
    id_token?: string;
    expires_at?: number;
    error?: string;
  }
}
