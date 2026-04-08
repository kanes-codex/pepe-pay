import { useEffect, useState } from "react";

export function useUser() {
  const [user, setUser] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await fetch("/api/users");
      const users = await res.json();

      const found = users.find((u: any) => u.id === Number(userId));
      if (found) setUser(found);
    }

    fetchUser();
  }, []);

  return user;
}