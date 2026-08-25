import type { NextAuthConfig } from "next-auth";

/** Edge-safe auth config used by middleware — no database or bcrypt imports here. */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  // Self-hosted deployment behind a reverse proxy / custom domain: trust the
  // incoming Host header rather than requiring a fixed AUTH_URL.
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.businessId = user.businessId;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.businessId = token.businessId;
      session.user.role = token.role;
      return session;
    },
  },
};
