"use client";

import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import { Search, LogOut, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateGroupModal } from "@/components/chat/CreateGroupModal";
import { ConversationItem } from "@/components/chat/ConversationItem";
import { UserItem } from "@/components/chat/UserItem";

export function LogoutButton() {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      title="Sign Out"
      className="bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400"
    >
      <LogOut className="h-5 w-5" />
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

  const createGroup = useMutation(api.conversations.createGroup);

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

  const filteredUsers =
    users?.filter(
      (u) =>
        u._id !== currentUser?._id &&
        u.username.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const filteredConversations =
    conversations?.filter((c) => {
      if (!search) return true;
      if (c.isGroup && c.groupName)
        return c.groupName.toLowerCase().includes(search.toLowerCase());
      if (c.otherUser)
        return c.otherUser.username
          .toLowerCase()
          .includes(search.toLowerCase());
      return false;
    }) ?? [];

  const handleCreateGroup = async (
    name: string,
    participants: Id<"users">[],
  ) => {
    const id = await createGroup({
      name,
      participants,
    });
    setSelectedConversation(id);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 font-sans">
      {/* LEFT SIDEBAR */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } w-full md:w-80 border-r border-gray-200 dark:border-zinc-800 flex-col bg-white dark:bg-zinc-900 shadow-sm z-10 shrink-0`}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 h-16">
          <div className="flex items-center gap-3">
            <UserButton />
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              Chats
            </span>
          </div>
          <div className="flex gap-1">
            <CreateGroupModal
              users={users}
              currentUser={currentUser}
              onCreateGroup={handleCreateGroup}
            />
            <LogoutButton />
          </div>
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
          {filteredUsers.length === 0 && search && (
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
            {users === undefined || conversations === undefined ? (
              // Loading State Skeletons
              Array.from({
                length: conversations ? conversations.length : 5,
              }).map((_, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))
            ) : (
              // Actual List (Conversations or Search Results)
              <>
                {!search &&
                  filteredConversations.map((conv) => (
                    <ConversationItem
                      key={conv._id}
                      conv={conv as any}
                      isSelected={selectedConversation === conv._id}
                      currentUser={currentUser}
                      users={users}
                      onClick={setSelectedConversation}
                    />
                  ))}

                {/* Search Results for starting new 1v1s */}
                {search &&
                  filteredUsers.map((u) => {
                    const conv = conversations?.find(
                      (c) => !c.isGroup && c.otherUser?._id === u._id,
                    );
                    const isSelected =
                      selectedConversation === (conv?._id || "temp");

                    return (
                      <UserItem
                        key={u._id}
                        user={u}
                        isSelected={isSelected}
                        onClick={async () => {
                          if (currentUser) {
                            const id = await startConversation({
                              u1: currentUser._id,
                              u2: u._id,
                            });
                            setSelectedConversation(id);
                            setSearch("");
                          }
                        }}
                      />
                    );
                  })}
              </>
            )}
          </div>
        </div>
      </div>

      {/* CHAT WINDOW */}
      <div
        className={`${
          selectedConversation ? "flex" : "hidden md:flex"
        } flex-1 bg-white dark:bg-zinc-950 flex-col`}
      >
        {selectedConversation ? (
          <ChatWindow
            conversationId={selectedConversation}
            currentUser={currentUser}
            otherUser={
              !conversations?.find((c) => c._id === selectedConversation)
                ?.isGroup
                ? conversations?.find((c) => c._id === selectedConversation)
                    ?.otherUser
                : undefined
            }
            groupData={
              conversations?.find((c) => c._id === selectedConversation)
                ?.isGroup
                ? conversations?.find((c) => c._id === selectedConversation)
                : undefined
            }
            allUsers={users}
            typingUsers={(() => {
              const c = conversations?.find(
                (c) => c._id === selectedConversation,
              );
              return c?.typingUsers
                ? c.typingUsers
                    .filter((id) => id !== currentUser?._id)
                    .map((id) => users?.find((u: Doc<"users">) => u._id === id))
                    .filter((u): u is Doc<"users"> => u !== undefined)
                : [];
            })()}
            onBack={() => setSelectedConversation(null)}
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
