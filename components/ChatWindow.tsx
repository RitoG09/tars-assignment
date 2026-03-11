"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { SendIcon, ChevronLeft, Trash2 } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ChatWindow({
  conversationId,
  currentUser,
  otherUser,
  isTyping,
  onBack,
}: any) {
  const messages = useQuery(api.messages.getMessages, {
    conversationId,
  });

  const sendMessage = useMutation(api.messages.sendMessage);
  const markRead = useMutation(api.messages.markRead);
  const setTyping = useMutation(api.conversations.setTyping);
  const deleteMessage = useMutation(api.messages.deleteMessage);

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (conversationId && currentUser) {
      markRead({ conversationId, userId: currentUser._id });
    }
  }, [messages, conversationId, currentUser, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTyping({ conversationId, typing: false, userId: currentUser._id });

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
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm z-10 shrink-0 h-16">
          <button
            onClick={onBack}
            className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
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
                    className={`flex items-center gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`px-4 py-2 text-sm shadow-sm ${
                        m.isDeleted
                          ? "bg-gray-100 dark:bg-zinc-800/60 text-gray-500 italic rounded-2xl border border-gray-200 dark:border-zinc-700"
                          : isCurrentUser
                            ? "bg-orange-500 text-white rounded-2xl rounded-tr-[4px]"
                            : "bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-[4px] border border-gray-100 dark:border-zinc-700"
                      }`}
                    >
                      {m.isDeleted ? "This message was deleted" : m.text}
                    </div>

                    {isCurrentUser && !m.isDeleted && (
                      <button
                        onClick={() =>
                          deleteMessage({
                            messageId: m._id,
                            userId: currentUser._id,
                          })
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <span
                    className={`text-[10px] text-gray-400 font-medium mt-1 ${isCurrentUser ? "mr-1" : "ml-1"}`}
                  >
                    {formatTimestamp(m.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex w-full justify-start group">
            <div className="flex max-w-[70%] items-end gap-2 flex-row">
              <div className="w-8 shrink-0">
                <Avatar className="h-8 w-8 mb-1 border border-gray-200 shadow-sm">
                  <AvatarImage src={otherUser?.image || ""} />
                  <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600">
                    {otherUser?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex flex-col items-start">
                <div className="px-4 py-3 bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-[4px] border border-gray-100 dark:border-zinc-700 shadow-sm flex items-center gap-1">
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
        )}

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
            onChange={(e) => {
              setText(e.target.value);
              setTyping({
                conversationId,
                typing: true,
                userId: currentUser._id,
              });
              if (typingTimeoutRef.current)
                clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                setTyping({
                  conversationId,
                  typing: false,
                  userId: currentUser._id,
                });
              }, 2000);
            }}
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
