"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    }

    fetchUsers();
  }, []);

  const handleSignIn = () => {
    if (!selectedUserId) return;

    localStorage.setItem("userId", String(selectedUserId));
    router.push("/");
  };

  return (
    <main className="p-10 text-white">
      <h1 className="text-2xl mb-6">SignIn</h1>

      <select
        value={selectedUserId ?? ""}
        onChange={(e) => setSelectedUserId(Number(e.target.value))}
        className="border p-2 rounded bg-white text-black"
      >
        <option value="">Select user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleSignIn}
        className="ml-4 px-4 py-2 bg-blue-500 rounded"
      >
        Continue
      </button>
    </main>
  );
}
