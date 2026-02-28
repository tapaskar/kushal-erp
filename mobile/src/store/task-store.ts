import { create } from "zustand";
import type { StaffTask } from "../lib/types";
import * as tasksApi from "../api/tasks";

interface TaskState {
  tasks: StaffTask[];
  isLoading: boolean;

  fetchTasks: (filters?: {
    status?: string;
    taskType?: string;
  }) => Promise<void>;
  updateStatus: (
    taskId: string,
    status: string,
    data?: {
      resolution?: string;
      beforePhotoUrl?: string;
      afterPhotoUrl?: string;
    }
  ) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async (filters) => {
    set({ isLoading: true });
    try {
      const data = await tasksApi.getTasks(filters);
      set({ tasks: data.tasks || [], isLoading: false });
    } catch {
      set({ tasks: [], isLoading: false });
    }
  },

  updateStatus: async (taskId, status, data) => {
    await tasksApi.updateTaskStatus(taskId, { status, ...data });
    // Update local state
    const tasks = get().tasks.map((t) =>
      t.id === taskId ? { ...t, status: status as StaffTask["status"] } : t
    );
    set({ tasks });
  },
}));
