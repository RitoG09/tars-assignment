"use client";

import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import { Search, LogOut, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function LogoutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign Out">
      <LogOut className="h-5 w-5 text-gray-500" />
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

  const setOnlineStatus = useMutation(api.users.updateOnlineStatus);

  useEffect(() => {
    if (!user) return;

    setOnlineStatus({ clerkId: user.id, isOnline: true });

    const handleVisibilityChange = () => {
      setOnlineStatus({
        clerkId: user.id,
        isOnline: document.visibilityState === "visible",
      });
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      // Attempt to set offline when component unmounts
      setOnlineStatus({ clerkId: user.id, isOnline: false });
    };
  }, [user, setOnlineStatus]);

  const [search, setSearch] = useState("");
  const [selectedConversation, setSelectedConversation] =
    useState<Id<"conversations"> | null>(null);

  const filtered =
    users?.filter((u) =>
      u.username.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 font-sans">
      {/* LEFT SIDEBAR */}
      <div className="w-80 border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 shadow-sm z-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 h-16">
          <div className="flex items-center gap-3">
            <UserButton />
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              Chats
            </span>
          </div>
          <LogoutButton />
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="w-full bg-gray-100 dark:bg-zinc-800 border-none rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filtered.length === 0 && search && (
            <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center">
              <MessageSquare className="h-8 w-8 text-gray-300 mb-3" />
              <p>No users found for "{search}"</p>
            </div>
          )}
          {conversations?.length === 0 && !search && (
            <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center">
              <MessageSquare className="h-8 w-8 text-gray-300 mb-3" />
              <p className="font-medium text-gray-700 dark:text-gray-300">
                No conversations yet.
              </p>
              <p className="mt-1">Search for a user to start chatting!</p>
            </div>
          )}
          <div className="py-2">
            {filtered?.map((u) => {
              const conv = conversations?.find(
                (c) => c.otherUser?._id === u._id,
              );
              const isSelected = selectedConversation === (conv?._id || "temp");

              return (
                <div
                  key={u._id}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-4 ${
                    isSelected
                      ? "bg-orange-50 dark:bg-orange-950/30 border-r-4 border-orange-500"
                      : "hover:bg-gray-50 dark:hover:bg-zinc-800/50 border-r-4 border-transparent"
                  }`}
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
                  <div className="relative">
                    <Avatar className="h-12 w-12 border border-gray-200 shadow-sm">
                      <AvatarImage src={u.image || ""} alt={u.username} />
                      <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
                        {u.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {u.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {u.username}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {conv?.lastMessage || "Start a new conversation"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 bg-white dark:bg-zinc-950 flex flex-col">
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation}
            currentUser={currentUser}
            otherUser={
              conversations?.find((c) => c._id === selectedConversation)
                ?.otherUser
            }
          />
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-gray-400 dark:text-zinc-600 bg-gray-50/50 dark:bg-zinc-900/20">
            <MessageSquare className="h-16 w-16 mb-4 opacity-50" />
            <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300">
              Welcome to Chat
            </h3>
            <p className="mt-2 text-sm max-w-sm text-center">
              Select a conversation from the sidebar or search for a user to
              start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
