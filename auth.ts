import NextAuth from "next-auth";
import Cognito from "next-auth/providers/cognito";
import { jwtDecode } from "jwt-decode";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Vercel은 리버스 프록시 -> Host injection 공격에서 안전함
  trustHost: true,
  providers: [
    Cognito({
      clientId: process.env.AUTH_COGNITO_ID!,
      issuer: process.env.AUTH_COGNITO_ISSUER!,
      checks: ["pkce", "state", "nonce"],
      client: { token_endpoint_auth_method: "none" },
      authorization: {
        params: {
          scope: "openid email phone",
          lang: "ko",
        },
      },
    }),
  ],
  pages: {
    error: "/", // 여기에 나중에 에러 시 페이지 추가해야함 
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        const decoded = jwtDecode(account.access_token!) as any;
        return {
          ...token,
          id: decoded.sub,
          nickName: decoded.username,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          id_token: account.id_token,
          expires_at: account.expires_at,
        };
      } else if (Date.now() < token.expires_at! * 1000) {
        // 토큰 만료 전
        return token;
      } else {
        // 만료됐는데 리프레시 토큰 없으면 오류
        if (!token.refresh_token) throw new TypeError("Missing refresh_token");

        try {
          const response = await fetch(
            `https://ap-northeast-2mmvclnrmp.auth.ap-northeast-2.amazoncognito.com/oauth2/token`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                client_id: process.env.AUTH_COGNITO_ID!,
                refresh_token: token.refresh_token!,
              }),
            }
          );

          const tokensOrError = await response.json();

          if (!response.ok) throw tokensOrError;

          const newTokens = tokensOrError as {
            access_token: string;
            expires_in: number;
            id_token: string;
          };

          return {
            ...token,
            access_token: newTokens.access_token,
            expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
            refresh_token: token.refresh_token,
          };
        } catch (error) {
          console.error("Error refreshing access_token", error);
          token.error = "refresh_tokenError";
          return token;
        }
      }
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.nickName = token.nickName as string;
      session.access_token = token.access_token;
      session.error = token.error;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // 로그인/회원가입이 끝나고 여기로 리다이렉트
      return `${baseUrl}/processing`;
    },
  },
});
