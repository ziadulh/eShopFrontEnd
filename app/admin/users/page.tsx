import UserTable from "@/components/UserTable";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getUsers() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) redirect("/login");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (res.status === 403) redirect("/admin?error=no_permission");
  if (!res.ok) return null;
  
  return await res.json();
}

export default async function UsersPage() {
  const users = await getUsers();

  if (!users) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-xl font-bold dark:text-white">Access Denied</h2>
        <p className="text-slate-500">You don't have permission to view this list.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">User Management</h1>
      <UserTable initialUsers={users} />
    </div>
  );
}