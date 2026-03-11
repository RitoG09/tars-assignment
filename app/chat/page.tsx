"use client";

import { useUser, UserButton, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import { Search, LogOut, MessageSquare, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedGroupUsers, setSelectedGroupUsers] = useState<Id<"users">[]>(
    [],
  );

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

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedGroupUsers.length === 0 || !currentUser)
      return;
    const id = await createGroup({
      name: groupName,
      participants: [...selectedGroupUsers, currentUser._id],
    });
    setGroupName("");
    setSelectedGroupUsers([]);
    setIsGroupModalOpen(false);
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
            <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1.5 text-sm bg-orange-50 hover:bg-orange-100 text-orange-600 border-none px-3 h-9"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">Create Group</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950">
                <DialogHeader>
                  <DialogTitle>Create Group Chat</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <input
                    className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border-none rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                    placeholder="Group Name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto no-scrollbar">
                    {users
                      ?.filter((u) => u._id !== currentUser?._id)
                      .map((u) => (
                        <div
                          key={u._id}
                          className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-lg cursor-pointer"
                          onClick={() => {
                            setSelectedGroupUsers((prev) =>
                              prev.includes(u._id)
                                ? prev.filter((id) => id !== u._id)
                                : [...prev, u._id],
                            );
                          }}
                        >
                          <Checkbox
                            checked={selectedGroupUsers.includes(u._id)}
                          />
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                            {u.username}
                          </label>
                        </div>
                      ))}
                  </div>
                  <Button
                    onClick={handleCreateGroup}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={
                      !groupName.trim() || selectedGroupUsers.length === 0
                    }
                  >
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
                  filteredConversations.map((conv) => {
                    const isSelected = selectedConversation === conv._id;
                    const displayAvatar = conv.isGroup
                      ? ""
                      : conv.otherUser?.image || "";
                    const displayName = conv.isGroup
                      ? conv.groupName
                      : conv.otherUser?.username;
                    const membersSubtext = conv.isGroup
                      ? `${conv.participantDetails?.length} members`
                      : conv.otherUser?.isOnline
                        ? "Online"
                        : "Offline";
                    const isOnline =
                      !conv.isGroup && (conv.otherUser?.isOnline || false);

                    const typingOtherUserIds =
                      conv.typingUsers?.filter(
                        (id) => id !== currentUser?._id,
                      ) || [];
                    const typingNames = typingOtherUserIds
                      .map(
                        (id) => users?.find((u: any) => u._id === id)?.username,
                      )
                      .filter(Boolean);
                    let typingText = "";
                    if (typingNames.length === 1) {
                      typingText = `${typingNames[0]} is typing...`;
                    } else if (typingNames.length > 1) {
                      typingText = `${typingNames.join(", ")} are typing...`;
                    }

                    return (
                      <div
                        key={conv._id}
                        className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-4 ${
                          isSelected
                            ? "bg-orange-50 dark:bg-orange-950/30 border-r-4 border-orange-500"
                            : "hover:bg-gray-50 dark:hover:bg-zinc-800/50 border-r-4 border-transparent"
                        }`}
                        onClick={() => setSelectedConversation(conv._id)}
                      >
                        <div className="relative shrink-0">
                          {conv.isGroup ? (
                            <div className="h-12 w-12 rounded-full border border-gray-200 shadow-sm bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-bold text-lg">
                              {conv.groupName?.substring(0, 2).toUpperCase()}
                            </div>
                          ) : (
                            <Avatar className="h-12 w-12 border border-gray-200 shadow-sm">
                              <AvatarImage
                                src={displayAvatar}
                                alt={displayName}
                              />
                              <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
                                {displayName?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col overflow-hidden">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                              {displayName}
                            </span>
                            {(conv.unreadCount ?? 0) > 0 && (
                              <span className="bg-orange-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {typingText ? (
                              <span className="text-orange-500 font-medium italic animate-pulse">
                                {typingText}
                              </span>
                            ) : (
                              conv.lastMessage ||
                              (conv.isGroup
                                ? membersSubtext
                                : "Start a new conversation")
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {/* Search Results for starting new 1v1s */}
                {search &&
                  filteredUsers.map((u) => {
                    const conv = conversations?.find(
                      (c) => !c.isGroup && c.otherUser?._id === u._id,
                    );
                    const isSelected =
                      selectedConversation === (conv?._id || "temp");

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
                            setSearch("");
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
                          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
                            {u.username}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Start a new conversation
                          </span>
                        </div>
                      </div>
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
                    .map((id) => users?.find((u) => u._id === id))
                    .filter(Boolean)
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
