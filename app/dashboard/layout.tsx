import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Sidebar } from "@/components/sidebar";
import {
  UserProvider,
  type UserProfile,
  type UserRole,
  type IconUserId,
} from "@/lib/user-context";
import { NotificationsProvider } from "@/lib/notifications-context";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;

  if (user.isActive === false) {
    redirect("/login");
  }

  const initialUser: UserProfile = {
    id: user.id,
    name: user.name ?? user.email,
    email: user.email,
    role: (user.role as UserRole) ?? "user",
    iconId: (user.avatarIcon as IconUserId) || "Users",
    team_id: user.teamId,
    isActive: user.isActive ?? true,
    deletedAt: null,
  };

  return (
    <UserProvider initialUser={initialUser}>
      <NotificationsProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="hidden md:flex flex-1 ml-[230px] min-h-screen flex-col overflow-hidden">
            {children}
          </main>

          {/* ✅ FIX: no usar overflow-hidden en móvil para no recortar dropdowns */}
          <main className="md:hidden flex-1 min-h-screen flex flex-col overflow-visible">
            {children}
          </main>
        </div>
      </NotificationsProvider>
    </UserProvider>
  );
}
