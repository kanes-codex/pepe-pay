"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    async function fetchUser() {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await fetch("/api/users");
      const users = await res.json();

      const user = users.find((u: any) => u.id === Number(userId));
      if (user) setUserName(user.name);
    }

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem("userId");
    window.location.href = "/signin";
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="flex gap-4">
        <Link href="/">Upload</Link>
        <Link href="/reminders">Reminders</Link>
      </div>

      <div className="flex gap-4 items-center">
        <span>{userName}</span>
        <button
          onClick={logout}
          className="text-sm bg-red-500 px-2 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
