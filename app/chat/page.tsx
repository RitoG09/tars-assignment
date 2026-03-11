"use client";

import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";

export function LogoutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Sign Out
    </Button>
  );
}

export default function ChatPage() {
  const { user } = useUser();

  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip",
  );

  const users = useQuery(
    api.users.getUsers,
    user ? { clerkId: user.id } : "skip",
  );

  const conversations = useQuery(
    api.conversations.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip",
  );

  const startConversation = useMutation(
    api.conversations.getOrCreateConversation,
  );

  const [search, setSearch] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Id<"conversations"> | null>(null);

  const filtered =
    users?.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  return (
    <div className="flex h-screen">
      {/* LEFT SIDEBAR */}
      <div className="w-80 border-r flex flex-col bg-white dark:bg-zinc-900">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-3 border-b">
          <UserButton />

          <LogoutButton />
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <input
            className="w-full border rounded-md p-2 text-sm"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {filtered?.map((u) => {
            const conv = conversations?.find((c) => c.otherUser?._id === u._id);
            return (
              <div
                key={u._id}
                className="p-3 border-b cursor-pointer hover:bg-gray-100"
                onClick={async () => {
                  if (currentUser) {
                    const id = await startConversation({
                      u1: currentUser._id,
                      u2: u._id,
                    });
                    setSelectedConversation(id);
                  }
                }}
              >
                <div className="font-medium">{u.username}</div>

                <div className="text-sm text-gray-500 truncate">
                  {conv?.lastMessage || "Start conversation"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation}
            currentUser={currentUser}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
