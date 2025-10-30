import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") {
            return [];
          }
          return document.cookie.split(";").map(cookie => {
            const [name, ...rest] = cookie.split("=");
            return { name: name.trim(), value: rest.join("=") };
          });
        },
        setAll(cookiesToSet) {
          if (typeof document === "undefined") {
            return;
          }
          cookiesToSet.forEach(({ name, value, options }) => {
            // Build cookie string with optimized settings
            const parts = [`${name}=${value}`];
            
            if (options?.maxAge) parts.push(`Max-Age=${options.maxAge}`);
            if (options?.path) parts.push(`Path=${options.path}`);
            if (options?.domain) parts.push(`Domain=${options.domain}`);
            if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);
            if (options?.secure) parts.push(`Secure`);
            if (options?.httpOnly) parts.push(`HttpOnly`);
            
            document.cookie = parts.join("; ");
          });
        },
      },
    }
  );
