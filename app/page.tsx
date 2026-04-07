"use client";

import { useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import { Item } from "./types";
import ItemRow from "@/components/ItemRow";
import { useRouter } from "next/navigation";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const payer = "Kane";

  const [participants, setParticipants] = useState<string[]>([]);
  const [newName, setNewName] = useState("");
  const [activeUser, setActiveUser] = useState<number | null>(0);

  const [assignments, setAssignments] = useState<Record<number, number>>({});

  const [debts, setDebts] = useState<
    { fromName: string; fromId: number; toId: number; amount: number }[]
  >([]);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [loading, setLoading] = useState(false);

  const totalBill = items.reduce((sum, item) => sum + item.price, 0);

  const [friends, setFriends] = useState<{ id: number; name: string }[]>([]);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/signin");
    }
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      setFriends(data);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    async function checkForDebts() {
      try {
        const res = await fetch("/api/reminders");
        const debts = await res.json();

        if (!("Notification" in window)) return;
        if (Notification.permission !== "granted") return;

        // prevent duplicate notifications
        const shown = JSON.parse(
          localStorage.getItem("shownReminders") || "[]",
        );

        debts.forEach((debt: any) => {
          if (!shown.includes(debt.id)) {
            const notification = new Notification("💸 Payment Reminder", {
              body: `You owe ${debt.to.name} £${debt.amount.toFixed(2)}`,
            });

            notification.onclick = () => {
              window.focus();
            };

            shown.push(debt.id);
          }
        });

        localStorage.setItem("shownReminders", JSON.stringify(shown));
      } catch (err) {
        console.error("Notification check failed:", err);
      }
    }

    checkForDebts();
  }, []);

  // =========================
  // OCR Upload
  // =========================
  const handleUpload = async () => {
    if (!image) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", image);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      console.log("RAW OCR:", text);

      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      const itemsWithIds = parsed.items.map((item: Item, index: number) => ({
        id: index,
        name: item.name,
        price: item.price,
      }));

      setItems(itemsWithIds);

      // reset state
      setAssignments({});
      setParticipants([]);
      setActiveUser(0);
      setDebts([]);
      setIsConfirmed(false);
    } catch (err) {
      console.error("OCR failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Assign items
  // =========================
  const toggleItem = (itemId: number) => {
    if (activeUser === null) return;

    setAssignments((prev) => {
      const currentOwner = prev[itemId];

      if (currentOwner === activeUser) {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      }

      return {
        ...prev,
        [itemId]: activeUser,
      };
    });
  };

  // =========================
  // Confirm split + save debts
  // =========================
  const handleConfirmSplit = async () => {
    try {
      console.log("🚀 Confirming split...");

      // 1️⃣ Fetch users
      const usersRes = await fetch("/api/users");
      const users = await usersRes.json();

      console.log("Users:", users);

      const getUserId = (name: string) =>
        users.find((u: any) => u.name === name)?.id;

      const payerId = getUserId(payer);

      // 2️⃣ Calculate debts
      const calculatedDebts = participants
        .map((name, index) => {
          const total = items
            .filter((item) => assignments[item.id] === index)
            .reduce((sum, item) => sum + item.price, 0);

          return {
            fromName: name,
            fromId: getUserId(name),
            toId: payerId,
            amount: total,
          };
        })
        .filter((d) => d.amount > 0 && d.fromId && d.toId);

      console.log("Debts:", calculatedDebts);

      setDebts(calculatedDebts);
      setIsConfirmed(true);

      // 3️⃣ Save to DB
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          debts: calculatedDebts,
        }),
      });

      const result = await res.text();
      console.log("API response:", result);
    } catch (err) {
      console.error("Failed to confirm split:", err);
    }
  };

  // =========================
  const isReady =
    participants.length > 0 && Object.keys(assignments).length > 0;

  // =========================
  return (
    <main className="p-10">
      <h1 className="text-2xl mb-4 text-white">Upload Receipt</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />

      <button
        onClick={handleUpload}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        disabled={loading}
      >
        Upload
      </button>

      {loading && <Spinner />}

      {image && !loading && (
        <img
          src={URL.createObjectURL(image)}
          alt="preview"
          className="mt-4 w-64"
        />
      )}

      {/* ========================= */}
      {/* Add People */}
      {/* ========================= */}
      <div className="mt-6">
        <h2 className="text-xl mb-2">Add people</h2>

        <div className="flex gap-2">
          <div className="flex gap-2">
            <select
              value={selectedFriendId ?? ""}
              onChange={(e) => setSelectedFriendId(Number(e.target.value))}
              className="border p-2 rounded bg-white text-black"
            >
              <option value="">Select friend</option>

              {friends
                .filter((f) => f.name !== payer) // exclude payer
                .map((friend) => (
                  <option key={friend.id} value={friend.id}>
                    {friend.name}
                  </option>
                ))}
            </select>

            <button
              onClick={() => {
                if (!selectedFriendId) return;

                const friend = friends.find((f) => f.id === selectedFriendId);
                if (!friend) return;

                if (participants.includes(friend.name)) return;

                setParticipants((prev) => {
                  const updated = [...prev, friend.name];
                  if (updated.length === 1) setActiveUser(0);
                  return updated;
                });

                setSelectedFriendId(null);
              }}
              className="bg-green-500 text-white px-3 rounded"
            >
              Add
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {participants.map((name, index) => (
            <button
              key={index}
              onClick={() => setActiveUser(index)}
              className={`px-3 py-1 rounded border ${
                activeUser === index ? "bg-blue-500 text-white" : ""
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* ========================= */}
      {/* Items */}
      {/* ========================= */}
      {items.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl mb-2">Select items</h2>

          {activeUser === null && (
            <p className="text-red-400 mb-2">Select a person first 👆</p>
          )}

          {items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              isSelected={assignments[item.id] === activeUser}
              onToggle={toggleItem}
              assignedTo={
                assignments[item.id] !== undefined
                  ? participants[assignments[item.id]]
                  : undefined
              }
            />
          ))}
        </div>
      )}

      {/* ========================= */}
      {/* Totals */}
      {/* ========================= */}
      <div className="mt-6">
        <h2 className="text-xl mb-2">Totals</h2>

        <div className="mt-6 p-4 border rounded bg-gray-900">
          <h2 className="text-xl mb-2">Bill Summary</h2>

          <div className="flex justify-between">
            <span>Total Bill</span>
            <span>£{totalBill.toFixed(2)}</span>
          </div>

          <div className="flex justify-between mt-1">
            <span>Paid by</span>
            <span>{payer}</span>
          </div>

          <p className="text-sm text-gray-400 mt-2">
            Others will pay {payer} back
          </p>
        </div>

        {participants.map((name, index) => {
          const total = items
            .filter((item) => assignments[item.id] === index)
            .reduce((sum, item) => sum + item.price, 0);

          return (
            <div key={index} className="flex justify-between mt-2">
              <span>{name}</span>
              <span>£{total.toFixed(2)}</span>
            </div>
          );
        })}

        {/* Confirm Button */}
        <button
          onClick={handleConfirmSplit}
          disabled={!isReady}
          className="mt-6 px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
        >
          Confirm Split
        </button>
      </div>

      {/* ========================= */}
      {/* Debts */}
      {/* ========================= */}
      {isConfirmed && (
        <div className="mt-6">
          <h2 className="text-xl mb-2">Who owes what</h2>

          {debts.map((debt, index) => (
            <div key={index} className="flex justify-between mt-2">
              <span>
                {debt.fromName} owes {payer} £{debt.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
