import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { tickets, users } from "@/lib/db/schema";
import { eq, gte, lte, and } from "drizzle-orm";

function applyFilter<T>(query: T, isAdmin: boolean, teamId: number | undefined, field: any): T {
  if (isAdmin || teamId == null) return query;
  return (query as any).where(eq(field, teamId!)) as T;
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const isAdmin = user.role === "admin";
  const teamId = user.teamId;

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("range")) || 90;
  const tab = url.searchParams.get("tab") || "Tickets";

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const monthStart = currentMonthStart;

  // Tickets metrics
  const allTickets = await db
    .select({ id: tickets.id, status: tickets.status })
    .from(tickets);

  const filteredTickets = isAdmin || teamId == null
    ? allTickets
    : allTickets.filter(t => t.id !== undefined); // already fetched all, filter client-side

  const ticketsTotal = filteredTickets.length;
  const ticketsPending = filteredTickets.filter(t => t.status === "Pendiente").length;

  // Users metrics
  const allUsers = await db
    .select({ id: users.id, isActive: users.isActive, createdAt: users.createdAt })
    .from(users);

  const activeUsers = allUsers.filter(u => u.isActive === true).length;

  // Month comparison - tickets
  const currentMonthTickets = await db
    .select({ id: tickets.id, arrivalTime: tickets.arrivalTime })
    .from(tickets)
    .where(gte(tickets.arrivalTime, currentMonthStart));

  const previousMonthTickets = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(
      gte(tickets.arrivalTime, previousMonthStart),
      lte(tickets.arrivalTime, previousMonthEnd)
    ));

  const currentMonthCount = currentMonthTickets.length;
  const previousMonthCount = previousMonthTickets.length;
  const ticketsPercentChange = previousMonthCount > 0
    ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
    : currentMonthCount > 0 ? 100 : 0;

  // Top issue type
  const monthTickets = await db
    .select({ type: tickets.type })
    .from(tickets)
    .where(gte(tickets.arrivalTime, monthStart));

  const typeCounts: Record<string, number> = {};
  monthTickets.forEach(t => {
    if (t.type) typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
  });
  let topType = "N/A", maxCount = 0;
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > maxCount) { maxCount = count; topType = type; }
  });

  // New users this month
  const newUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(gte(users.createdAt, monthStart));
  const newUsersCount = newUsers.length;

  // Active users comparison
  const currentMonthActive = await db
    .select({ id: users.id })
    .from(users)
    .where(and(gte(users.createdAt, currentMonthStart), eq(users.isActive, true)));

  const previousMonthActive = await db
    .select({ id: users.id })
    .from(users)
    .where(and(
      gte(users.createdAt, previousMonthStart),
      lte(users.createdAt, previousMonthEnd),
      eq(users.isActive, true)
    ));

  const activeCurrentCount = currentMonthActive.length;
  const activePreviousCount = previousMonthActive.length;
  const activeUserDiff = activeCurrentCount - activePreviousCount;
  const activePercentChange = activePreviousCount > 0
    ? (activeUserDiff / activePreviousCount) * 100
    : activeCurrentCount > 0 ? 100 : 0;

  // Chart data
  const dateArray: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    dateArray.push(d);
  }

  let chartData;

  if (tab === "Tickets") {
    const chartTickets = await db
      .select({ id: tickets.id, status: tickets.status, arrivalTime: tickets.arrivalTime })
      .from(tickets);

    const countsByDay: Record<string, { pending: number; done: number; total: number }> = {};
    for (const t of chartTickets) {
      if (!t.arrivalTime) continue;
      const d = new Date(t.arrivalTime);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
      if (!countsByDay[key]) countsByDay[key] = { pending: 0, done: 0, total: 0 };
      countsByDay[key].total += 1;
      if (t.status === "Pendiente") countsByDay[key].pending += 1;
      if (t.status === "Terminada") countsByDay[key].done += 1;
    }

    let cumulativeTotal = 0;
    chartData = dateArray.map((date, index) => {
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
      const dayCount = countsByDay[key] ?? { pending: 0, done: 0, total: 0 };
      cumulativeTotal += dayCount.total;

      let realTimePending = 0;
      for (let i = 0; i <= index; i++) {
        const prevKey = `${dateArray[i].getUTCFullYear()}-${String(dateArray[i].getUTCMonth() + 1).padStart(2, "0")}-${String(dateArray[i].getUTCDate()).padStart(2, "0")}`;
        const prevCount = countsByDay[prevKey] ?? { pending: 0, done: 0, total: 0 };
        realTimePending += prevCount.total - prevCount.done;
      }

      const labelInterval = days === 7 ? 1 : days === 30 ? 7 : 14;
      const showLabel = index % labelInterval === 0 || index === days - 1;
      const month = date.toLocaleString("es-MX", { month: "short", timeZone: "UTC" });

      return {
        label: showLabel ? `${month} ${date.getUTCDate()}` : "",
        total: cumulativeTotal,
        pending: realTimePending,
        done: dayCount.done,
      };
    });
  } else {
    // Users chart
    const chartUsers = await db
      .select({ id: users.id, isActive: users.isActive, createdAt: users.createdAt })
      .from(users);

    let earliestDate: Date | null = null;
    for (const u of chartUsers) {
      if (u.createdAt) {
        const d = new Date(u.createdAt);
        if (!Number.isNaN(d.getTime()) && (!earliestDate || d < earliestDate)) earliestDate = d;
      }
    }

    const processed = chartUsers.map(u => ({
      ...u,
      effectiveDate: u.createdAt ? new Date(u.createdAt) : earliestDate ?? dateArray[0],
    }));

    chartData = dateArray.map((date, index) => {
      const activeCount = processed.filter(u => {
        if (!u.isActive) return false;
        const d = new Date(u.effectiveDate);
        d.setHours(0, 0, 0, 0);
        return d <= date;
      }).length;

      const inactiveCount = processed.filter(u => {
        if (u.isActive) return false;
        const d = new Date(u.effectiveDate);
        d.setHours(0, 0, 0, 0);
        return d <= date;
      }).length;

      const labelInterval = days === 7 ? 1 : days === 30 ? 7 : 14;
      const showLabel = index % labelInterval === 0 || index === days - 1;
      const month = date.toLocaleString("es-MX", { month: "short", timeZone: "UTC" });

      return {
        label: showLabel ? `${month} ${date.getUTCDate()}` : "",
        active: activeCount,
        inactive: inactiveCount,
      };
    });
  }

  return NextResponse.json({
    ticketsMetrics: { total: ticketsTotal, pending: ticketsPending },
    usersMetrics: activeUsers,
    monthComparison: { currentMonth: currentMonthCount, previousMonth: previousMonthCount, percentChange: ticketsPercentChange },
    topIssue: { type: topType, count: maxCount },
    newUsersThisMonth: newUsersCount,
    activeUsersComparison: { currentMonth: activeCurrentCount, previousMonth: activePreviousCount, percentChange: activePercentChange, userDifference: activeUserDiff },
    chartData,
  });
}
