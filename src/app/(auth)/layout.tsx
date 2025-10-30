import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Autenticación | CEMSE-IA",
  description: "Página de autenticación de CEMSE-IA",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md px-6 py-12">{children}</div>
    </div>
  );
}

