import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ResidentSidebar } from "@/components/layout/resident-sidebar";
import { Header } from "@/components/layout/header";

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "resident") redirect("/");

  return (
    <div className="min-h-screen">
      <ResidentSidebar />
      <div className="md:pl-64">
        <Header userName={session.name} sidebar={<ResidentSidebar mobile />} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
