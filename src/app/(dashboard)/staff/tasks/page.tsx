import { TasksClient } from "./tasks-client";
import { getStaffTasks, getStaffList } from "@/services/staff-admin.service";

export default async function TasksPage() {
  const [rawTasks, staffList] = await Promise.all([
    getStaffTasks(),
    getStaffList(),
  ]);

  const tasks = rawTasks.map((r) => ({
    id: r.task.id,
    taskType: r.task.taskType,
    title: r.task.title,
    description: r.task.description,
    priority: r.task.priority,
    status: r.task.status,
    location: r.task.location,
    dueBy: r.task.dueBy?.toISOString() ?? null,
    staffId: r.task.staffId,
    staffName: r.staffName,
    createdAt: r.task.createdAt,
  }));

  return <TasksClient tasks={tasks} staffList={staffList} />;
}
