"use client";

import { useUser } from "@/app/hooks/useUser";
import Link from "next/link";

export default function Navbar() {
  const user = useUser();

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
        <span>{user?.name}</span>
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
