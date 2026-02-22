import { getAllUsers } from "@/services/admin.service";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const users = await getAllUsers();

  return <UsersClient users={users} />;
}
