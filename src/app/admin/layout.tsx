import SideTable from "@/components/SideTable";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SideTable userEmail="admin@test.com">{children}</SideTable>;
}
