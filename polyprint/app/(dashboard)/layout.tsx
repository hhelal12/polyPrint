import Navbar from "@/components/shared/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F4F7F9]">
      <Navbar />
      <main className="mx-auto max-w-7xl p-6">
        {children}
      </main>
    </div>
  );
}