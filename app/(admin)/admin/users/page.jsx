import { listAllUsersAdmin } from "@/lib/users/actions";
import { UserManager } from "./UserManager";

export default async function AdminUsersPage() {
  const users = await listAllUsersAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-muted-foreground">All registered users and their roles.</p>
      </div>
      <UserManager initialUsers={users} />
    </div>
  );
}
