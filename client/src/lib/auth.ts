import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import { AuthTokenPayload } from "@/features/auth/types/auth";
import { cookies } from "next/headers";

// ─────────────────────────────────────────────────────────────
// Helper: Exchange social provider token with NestJS backend
// ─────────────────────────────────────────────────────────────

async function exchangeSocialToken(providerToken: string, provider: string) {
  const nestRes = await fetch(
    `${process.env.BACKEND_API_URL}/auth/sign-in/social`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "X-Provider": provider.toUpperCase(),
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
    },
  );

  if (!nestRes.ok) {
    const errBody = await nestRes.text();
    console.error(
      `[NextAuth] NestJS sign-in failed ${nestRes.status}:`,
      errBody,
    );
    throw new Error("NestJS Authentication Failed");
  }

  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();

  // Forward Set-Cookie headers from NestJS to the browser
  forwardSetCookieHeaders(nestRes, cookieStore);

  // Set client-readable expiry cookies
  await setExpirationCookies(nestRes, cookieStore);
}

// ─────────────────────────────────────────────────────────────
// Helper: Forward NestJS Set-Cookie headers to Next.js cookies
// ─────────────────────────────────────────────────────────────

function forwardSetCookieHeaders(
  nestRes: Response,
  cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>>,
) {
  const setCookieHeaders = nestRes.headers.getSetCookie();

  for (const cookieStr of setCookieHeaders) {
    const parts = cookieStr.split(";").map((p) => p.trim());
    const [nameValue, ...attributes] = parts;
    const splitIdx = nameValue.indexOf("=");
    const name = nameValue.substring(0, splitIdx);
    const value = nameValue.substring(splitIdx + 1);

    let httpOnly = false;
    let secure = false;
    let maxAge: number | undefined;
    let path = "/";
    let sameSite: "lax" | "strict" | "none" = "lax";

    attributes.forEach((attr) => {
      const lowerAttr = attr.toLowerCase();
      if (lowerAttr === "httponly") httpOnly = true;
      if (lowerAttr === "secure") secure = true;
      if (lowerAttr.startsWith("max-age="))
        maxAge = parseInt(attr.split("=")[1], 10);
      if (lowerAttr.startsWith("path=")) path = attr.split("=")[1];
      if (lowerAttr.startsWith("samesite=")) {
        const s = lowerAttr.split("=")[1];
        if (s === "lax" || s === "strict" || s === "none") {
          sameSite = s;
        }
      }
    });

    cookieStore.set(name, value, {
      httpOnly,
      secure,
      maxAge,
      path,
      sameSite,
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Helper: Set client-readable token expiration cookies
// ─────────────────────────────────────────────────────────────

async function setExpirationCookies(
  nestRes: Response,
  cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>>,
) {
  const { CLIENT_ACCESS_EXP_KEY, CLIENT_REFRESH_EXP_KEY } =
    await import("@/lib/auth/tokenUtils");

  const data = (await nestRes.json()).data as AuthTokenPayload;
  const expires = new Date(data.refreshTokenExpiresAt * 1000);

  cookieStore.set(CLIENT_ACCESS_EXP_KEY, data.accessTokenExpiresAt.toString(), {
    path: "/",
    expires,
    sameSite: "lax",
    httpOnly: false,
  });

  cookieStore.set(
    CLIENT_REFRESH_EXP_KEY,
    data.refreshTokenExpiresAt.toString(),
    {
      path: "/",
      expires,
      sameSite: "lax",
      httpOnly: false,
    },
  );
}

async function linkSocialAccount(
  providerToken: string,
  provider: string,
  coookieString: string,
) {
  const nestRes = await fetch(
    `${process.env.BACKEND_API_URL}/user/me/link-account`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "X-Provider": provider.toUpperCase(),
        "Content-Type": "application/json",
        Cookie: coookieString,
      },
      body: "{}",
      cache: "no-store",
    },
  );

  if (!nestRes.ok) {
    const errBody = await nestRes.text();
    console.error(
      `[NextAuth] NestJS sign-in failed ${nestRes.status}:`,
      errBody,
    );
    throw new Error("NestJS Authentication Failed");
  }
}

// ─────────────────────────────────────────────────────────────
// NextAuth Configuration
// ─────────────────────────────────────────────────────────────

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        const provider = account.provider;
        const providerToken =
          provider === "google" ? account.id_token : account.access_token;

        if (!providerToken) {
          console.error(`[NextAuth] No token found for provider ${provider}`);
          return token;
        }

        const cookieStore = await cookies();

        const authFlow = cookieStore.get("auth_flow")?.value;
        const nestAccessToken = cookieStore.get("access_token")?.value;

        try {
          if (authFlow === "link_account" && nestAccessToken) {
            await linkSocialAccount(
              providerToken,
              provider,
              cookieStore.toString(),
            );
          } else {
            await exchangeSocialToken(providerToken, provider);
          }
        } catch (err) {
          console.error("[NextAuth] External auth error:", err);
        } finally {
          if (authFlow) {
            cookieStore.delete("auth_flow");
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});
