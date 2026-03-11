"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { SendIcon } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ChatWindow({
  conversationId,
  currentUser,
  otherUser,
}: any) {
  const messages = useQuery(api.messages.getMessages, {
    conversationId,
  });

  const sendMessage = useMutation(api.messages.sendMessage);

  const [text, setText] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage({
      conversationId,
      sender: currentUser._id,
      text,
    });

    setText("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-zinc-950 font-sans">
      {/* HEADER */}
      {otherUser && (
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm z-10 h-16">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-gray-200 shadow-sm">
              <AvatarImage
                src={otherUser.image || ""}
                alt={otherUser.username}
              />
              <AvatarFallback className="bg-orange-100 text-orange-600 font-medium">
                {otherUser.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {otherUser.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {otherUser.username}
            </span>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              {otherUser.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      )}

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages?.length === 0 && (
          <div className="flex flex-col flex-1 h-full items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
            <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-full mb-3">
              <SendIcon className="h-6 w-6 text-gray-400" />
            </div>
            No messages yet. Start the conversation 👋
          </div>
        )}
        {messages?.map((m, index) => {
          const isCurrentUser = m.sender === currentUser._id;
          const showAvatar =
            !isCurrentUser &&
            (index === 0 || messages[index - 1].sender !== m.sender);

          return (
            <div
              key={m._id}
              className={`flex w-full ${isCurrentUser ? "justify-end" : "justify-start"} group`}
            >
              <div
                className={`flex max-w-[70%] items-end gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Receiver Avatar */}
                {!isCurrentUser && (
                  <div className="w-8 shrink-0">
                    {showAvatar ? (
                      <Avatar className="h-8 w-8 mb-1 border border-gray-200 shadow-sm">
                        <AvatarImage src={otherUser?.image || ""} />
                        <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600">
                          {otherUser?.username?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-8 h-8" />
                    )}
                  </div>
                )}

                <div
                  className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`px-4 py-2 text-sm shadow-sm ${
                      isCurrentUser
                        ? "bg-orange-500 text-white rounded-2xl rounded-tr-[4px]"
                        : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-[4px] border border-gray-100 dark:border-zinc-700"
                    }`}
                  >
                    {m.text}
                  </div>

                  <span
                    className={`text-[10px] text-gray-400 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isCurrentUser ? "mr-1" : "ml-1"}`}
                  >
                    {formatTimestamp(m.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
        <form
          className="flex items-center gap-2 max-w-4xl mx-auto relative"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 border-none rounded-full px-5 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="absolute right-1.5 p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-full transition-colors flex items-center justify-center shadow-sm"
          >
            <SendIcon className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
