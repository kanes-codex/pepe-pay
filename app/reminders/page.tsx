"use client";

import { REMINDER_TEMPLATES } from "@/lib/remindersTemplates";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Reminder {
  id: number;
  amount: number;
  to: {
    id: number;
    name: string;
  };
  createdAt: string;
}

interface DisplayReminder extends Reminder {
  message: string;
  image: string;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<DisplayReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/signin");
    }
  }, []);

  useEffect(() => {
    async function fetchReminders() {
      try {
        const userId = localStorage.getItem("userId");

        const res = await fetch(`/api/reminders?userId=${userId}`);
        const data: Reminder[] = await res.json();

        const decorated = data.map((reminder) => {
          const randomTemplate =
            REMINDER_TEMPLATES[reminder.id % REMINDER_TEMPLATES.length];

          return {
            ...reminder,
            message: randomTemplate.message,
            image: randomTemplate.image,
          };
        });

        setReminders(decorated);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReminders();
  }, []);

  if (loading) return <p className="p-10 text-white">Loading reminders…</p>;

  const handleMarkPaid = async (id: number) => {
    try {
      await fetch(`/api/debts/${id}`, {
        method: "DELETE",
      });

      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Failed to mark as paid:", err);
    }
  };

  return (
    <main className="p-10">
      <h1 className="text-2xl mb-6 text-white">Your Debts 💸</h1>

      <div className="space-y-4">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className="border rounded p-4 bg-gray-900 flex justify-between items-center"
          >
            <Link
              href={`/receipts/${reminder.id}`}
              className="flex gap-4 flex-1"
            >
              <img
                src={reminder.image}
                alt="reminder"
                className="w-16 h-16 object-cover rounded"
              />

              <div className="flex-1">
                <p className="text-white">{reminder.message}</p>
                <p className="text-sm text-gray-400 mt-1">
                  You owe {reminder.to.name} £{reminder.amount.toFixed(2)}
                </p>
              </div>
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleMarkPaid(reminder.id);
              }}
              className="ml-4 text-xs bg-green-600 px-2 py-1 rounded"
            >
              Mark Paid
            </button>
          </div>
        ))}

        {reminders.length === 0 && (
          <p className="text-gray-400">You’re debt free 🎉</p>
        )}
      </div>
    </main>
  );
}
