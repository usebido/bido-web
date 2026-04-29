import { AppDashboardLayout } from "@/components/app/app-dashboard-layout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppDashboardLayout>{children}</AppDashboardLayout>;
}
