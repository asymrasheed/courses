import { cookies } from "next/headers";
import Sidebar from "@/components/Sidebar";
import { COOKIE_NAME, verifySession } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const cookieStore = await cookies();
  const session = await verifySession(cookieStore.get(COOKIE_NAME)?.value);

  return (
    <div className="flex">
      <Sidebar email={session?.email} />
      <main className="app-shell flex-1 min-h-screen px-8 md:px-12 py-10">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
