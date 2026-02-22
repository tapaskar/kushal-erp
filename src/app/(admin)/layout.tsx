import { redirect } from "next/navigation";
import { getSession, isSuperAdmin } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Header } from "@/components/layout/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isSuperAdmin(session)) redirect("/");

  return (
    <div className="min-h-screen">
      <AdminSidebar />
      <div className="md:pl-60">
        <Header userName={session.name} sidebar={<AdminSidebar mobile />} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
