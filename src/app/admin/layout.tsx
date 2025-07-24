import StaffLayout from "@/components/StaffLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <StaffLayout userEmail="admin@test.com">
      {children}
    </StaffLayout>
  );
}
