"use client";

import { useEffect, useRef, useState } from "react";
import {
  useSensor,
  useSensors,
  PointerSensor,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { useUser } from "@/lib/user-context";
import { useToast } from "@/hooks/use-toast";

import type {
  KanbanColumn,
  KanbanMember,
  KanbanTask,
} from "./kanban.types";
import type { IconUserId } from "@/lib/user-context";
import { COLUMNS } from "./kanban.config";

export function useKanbanBoard() {
  const { user } = useUser();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [members, setMembers] = useState<KanbanMember[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<KanbanTask | null>(null);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [overColumn, setOverColumn] = useState<KanbanColumn | null>(null);
  const [loading, setLoading] = useState(false);
  const [myTeamId, setMyTeamId] = useState<number | null>(null);
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState<string>("");

  const [confirmDeleteTask, setConfirmDeleteTask] = useState<string | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const taskById = useRef<Map<string, KanbanTask>>(new Map());
  tasks.forEach((t) => taskById.current.set(t.id, t));

  async function fetchTeamData() {
    setLoading(true);
    try {
      const sessionRes = await fetch("/api/auth/get-session");
      const sessionData = await sessionRes.json();
      const currentUser = sessionData?.user;

      if (!currentUser) {
        console.warn("Could not resolve user from session");
        return;
      }

      const userId = Number(currentUser.id);
      const teamId = Number(currentUser.teamId);
      setMyUserId(userId);
      setMyTeamId(teamId);

      const teamRes = await fetch("/api/teams");
      const allTeams = await teamRes.json();
      const team = allTeams.find((t: any) => t.id === teamId);

      if (team) setTeamName(team.name ?? "");

      await fetchMembers(teamId);
      await fetchTasks(teamId);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMembers(teamId: number) {
    try {
      const res = await fetch(`/api/users?team_id=${teamId}`);
      const data = await res.json();

      setMembers(
        (data ?? []).map((u: any) => ({
          id: Number(u.id),
          full_name: u.fullName ?? "",
          avatar_icon: (u.avatarIcon as IconUserId) || "Users",
        }))
      );
    } catch (err) {
      console.error("Error fetching team members", err);
    }
  }

  async function fetchTasks(teamId: number) {
    try {
      const res = await fetch(`/api/tasks?team_id=${teamId}`);
      const data = await res.json();

      const mapped = (data ?? []).map((row: any) => ({
        id: `TSK-${String(row.id).padStart(4, "0")}`,
        dbId: row.id,
        title: row.title,
        description: row.description,
        status: row.status,
        start_date: row.start_date,
        end_date: row.end_date,
        assigned_to: row.assigned_to ?? [],
        team_id: row.team_id,
      }));

      setTasks(mapped);
    } catch (err) {
      console.error("Error fetching tasks", err);
    }
  }

  useEffect(() => {
    fetchTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.email]);

  function onDragStart(event: DragStartEvent) {
    const task = taskById.current.get(event.active.id as string);
    if (task) setActiveTask(task);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id;

    const overTask = tasks.find((t) => t.id === overId);
    const targetColumn: KanbanColumn | null = overTask
      ? overTask.status
      : (COLUMNS.find((c) => c.id === overId)?.id ?? null);

    if (!targetColumn) return;
    setOverColumn(targetColumn);

    const activeTaskLocal = tasks.find((t) => t.id === activeId);
    if (!activeTaskLocal || activeTaskLocal.status === targetColumn) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: targetColumn } : t))
    );
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    setOverColumn(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    try {
      const res = await fetch(`/api/tasks/${task.dbId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: task.status }),
      });

      if (!res.ok) {
        console.error("Error updating task status");
        toast({
          title: "Error al actualizar",
          description: "No se pudo cambiar el estado de la tarea.",
          variant: "destructive",
        });
        if (myTeamId) await fetchTasks(myTeamId);
        return;
      }

      toast({
        title: "Estado actualizado",
        description: `Tarea movida a ${task.status}`,
      });

      if (activeId !== overId) {
        setTasks((prev) => {
          const activeIndex = prev.findIndex((t) => t.id === activeId);
          const overIndex = prev.findIndex((t) => t.id === overId);
          if (activeIndex !== -1 && overIndex !== -1) {
            return arrayMove(prev, activeIndex, overIndex);
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Exception updating task:", err);
      toast({
        title: "Error",
        description: "No se pudo guardar el cambio.",
        variant: "destructive",
      });
    }
  }

  async function handleAddTask(task: Omit<KanbanTask, "id" | "dbId">) {
    if (!myTeamId) return;

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        status: task.status,
        end_date: task.end_date,
        assigned_to: task.assigned_to,
        team_id: myTeamId,
      }),
    });

    if (!res.ok) {
      toast({ title: "Error al crear tarea", description: "No se pudo guardar" });
      console.error("Error creating task");
      return;
    }

    const newTask = await res.json();

    toast({ title: "Tarea creada", description: "Se agregó correctamente." });
    setShowCreate(false);
    await fetchTasks(myTeamId);
  }

  async function handleUpdateTask(task: KanbanTask) {
    const res = await fetch(`/api/tasks/${task.dbId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        status: task.status,
        end_date: task.end_date,
        assigned_to: task.assigned_to,
      }),
    });

    if (!res.ok) {
      toast({ title: "Error al actualizar", description: "No se pudo guardar." });
      console.error("Error updating task");
      return;
    }

    setEditTask(null);
    toast({ title: "Tarea actualizada", description: "Cambios guardados." });
    if (myTeamId) await fetchTasks(myTeamId);
  }

  function handleDeleteTask(taskId: string) {
    setConfirmDeleteTask(taskId);
  }

  async function confirmDeleteTaskAction() {
    if (!confirmDeleteTask) return;

    const task = tasks.find((t) => t.id === confirmDeleteTask);
    if (!task) return;

    setIsDeletingTask(true);

    const res = await fetch(`/api/tasks/${task.dbId}`, { method: "DELETE" });

    if (!res.ok) {
      toast({ title: "Error al eliminar", description: "No se pudo eliminar." });
      setIsDeletingTask(false);
      setConfirmDeleteTask(null);
      return;
    }

    setTasks((prev) => prev.filter((t) => t.id !== confirmDeleteTask));
    toast({ title: "Tarea eliminada" });
    setIsDeletingTask(false);
    setConfirmDeleteTask(null);
  }

  // ✅ NUEVO: mover tarea por botones (móvil)
  async function moveTaskToStatus(taskId: string, nextStatus: KanbanColumn) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    const res = await fetch(`/api/tasks/${task.dbId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (!res.ok) {
      console.error("Error updating task status (buttons)");
      toast({
        title: "Error al actualizar",
        description: "No se pudo cambiar el estado de la tarea.",
        variant: "destructive",
      });
      // rollback by refetch
      if (myTeamId) await fetchTasks(myTeamId);
      return;
    }

    toast({
      title: "Estado actualizado",
      description: `Tarea movida a ${nextStatus}`,
    });
  }

  return {
    // data
    tasks,
    members,
    loading,
    teamName,

    // ui state
    showCreate,
    setShowCreate,
    editTask,
    setEditTask,
    activeTask,
    overColumn,

    // delete modal
    confirmDeleteTask,
    isDeletingTask,
    setConfirmDeleteTask,
    confirmDeleteTaskAction,

    // actions
    handleAddTask,
    handleUpdateTask,
    handleDeleteTask,

    // ✅ new action for mobile buttons
    moveTaskToStatus,

    // dnd
    sensors,
    onDragStart,
    onDragOver,
    onDragEnd,
  };
}