"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { SendIcon } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { GroupData } from "@/lib/types";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatInput } from "./chat/ChatInput";
import { MessageBubble } from "./chat/MessageBubble";

interface ChatWindowProps {
  conversationId: Id<"conversations">;
  currentUser?: Doc<"users"> | null;
  otherUser?: Doc<"users"> | null;
  typingUsers?: Doc<"users">[];
  onBack: () => void;
  groupData?: GroupData | null;
  allUsers?: Doc<"users">[];
}

export default function ChatWindow({
  conversationId,
  currentUser,
  otherUser,
  typingUsers = [],
  onBack,
  groupData,
  allUsers,
}: ChatWindowProps) {
  const messages = useQuery(api.messages.getMessages, {
    conversationId,
  });

  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.messages.markRead);
  const setTyping = useMutation(api.conversations.setTyping);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const toggleReaction = useMutation(api.messages.toggleReaction);

  const [activeReactionMessage, setActiveReactionMessage] = useState<
    string | null
  >(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

  useEffect(() => {
    if (conversationId && currentUser) {
      markRead({ conversationId, userId: currentUser._id });
    }
  }, [messages, conversationId, currentUser, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] font-sans relative overflow-hidden">
      {/* WhatsApp Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.4] dark:opacity-[0.15] pointer-events-none z-0"
        style={{
          backgroundImage:
            'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundRepeat: "repeat",
        }}
      />
      {/* HEADER */}
      <ChatHeader onBack={onBack} groupData={groupData} otherUser={otherUser} />

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative z-10">
        {messages === undefined ? (
          // Skeletons
          <div className="flex flex-col space-y-4">
            <div className="flex w-full justify-start">
              <div className="flex max-w-[70%] items-end gap-2 flex-row">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <Skeleton className="h-10 w-48 rounded-2xl rounded-tl-[4px]" />
              </div>
            </div>
            <div className="flex w-full justify-end">
              <Skeleton className="h-10 w-64 rounded-2xl rounded-tr-[4px]" />
            </div>
            <div className="flex w-full justify-end">
              <Skeleton className="h-12 w-40 rounded-2xl rounded-tr-[4px]" />
            </div>
          </div>
        ) : messages?.length === 0 ? (
          <div className="flex flex-col flex-1 h-full items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            <div className="bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm p-4 rounded-full mb-3 shadow-sm border border-black/5 dark:border-white/5">
              <SendIcon className="h-6 w-6 text-gray-400" />
            </div>
            No messages yet. Start the conversation 👋
          </div>
        ) : (
          messages?.map((m: Doc<"messages">, index: number) => {
            const isCurrentUser = currentUser && m.sender === currentUser._id;
            const senderUser =
              allUsers?.find((u: Doc<"users">) => u._id === m.sender) ||
              otherUser;
            const showAvatar =
              !isCurrentUser &&
              (index === 0 || messages[index - 1].sender !== m.sender);

            return (
              <MessageBubble
                key={m._id}
                message={m}
                isCurrentUser={isCurrentUser}
                senderUser={senderUser}
                showAvatar={showAvatar}
                groupData={groupData}
                activeReactionMessage={activeReactionMessage}
                setActiveReactionMessage={setActiveReactionMessage}
                currentUser={currentUser}
                toggleReaction={toggleReaction}
                deleteMessage={deleteMessage}
                EMOJIS={EMOJIS}
              />
            );
          })
        )}

        {typingUsers.map((u: Doc<"users">) => (
          <div key={u._id} className="flex w-full justify-start group mt-2">
            <div className="flex max-w-[70%] items-end gap-2 flex-row">
              <div className="w-8 shrink-0">
                <Avatar className="h-8 w-8 mb-1 border border-gray-200 shadow-sm">
                  <AvatarImage src={u.image || ""} />
                  <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600">
                    {u.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col items-start">
                <div className="px-4 py-3 bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-2xl rounded-tl-[4px] border border-black/5 dark:border-white/5 shadow-sm flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium italic">
                    {u.username} is typing
                  </span>
                  <div className="flex gap-1">
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "-0.3s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "-0.15s" }}
                    ></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef} className="h-1" />
      </div>

      <ChatInput conversationId={conversationId} currentUser={currentUser} />
    </div>
  );
}
