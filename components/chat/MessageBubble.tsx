import { Smile, Trash2 } from "lucide-react";
import { formatTimestamp } from "@/lib/formatTimestamp";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface MessageBubbleProps {
  message: Doc<"messages">;
  isCurrentUser: boolean | null | undefined;
  senderUser: Doc<"users"> | null | undefined;
  showAvatar: boolean;
  groupData?: any;
  activeReactionMessage: string | null;
  setActiveReactionMessage: (id: string | null) => void;
  currentUser: Doc<"users"> | null | undefined;
  toggleReaction: (args: {
    messageId: Id<"messages">;
    userId: Id<"users">;
    emoji: string;
  }) => void;
  deleteMessage: (args: {
    messageId: Id<"messages">;
    userId: Id<"users">;
  }) => void;
  EMOJIS: string[];
}

export function MessageBubble({
  message: m,
  isCurrentUser,
  senderUser,
  showAvatar,
  groupData,
  activeReactionMessage,
  setActiveReactionMessage,
  currentUser,
  toggleReaction,
  deleteMessage,
  EMOJIS,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex w-full ${isCurrentUser ? "justify-end" : "justify-start"} group`}
    >
      <div
        className={`flex max-w-[70%] items-end gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Receiver Avatar */}
        {!isCurrentUser && (
          <div className="w-8 shrink-0">
            {showAvatar ? (
              <div className="flex flex-col items-center">
                <Avatar className="h-8 w-8 mb-1 border border-gray-200 shadow-sm">
                  <AvatarImage src={senderUser?.image || ""} />
                  <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600">
                    {senderUser?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {groupData && showAvatar && (
                  <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px]">
                    {senderUser?.username}
                  </span>
                )}
              </div>
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
                  ? "bg-white/50 dark:bg-[#202c33]/50 text-gray-500 italic rounded-2xl border border-black/5 dark:border-white/5"
                  : isCurrentUser
                    ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-2xl rounded-tr-[4px]"
                    : "bg-white dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-2xl rounded-tl-[4px] border border-black/5 dark:border-white/5"
              }`}
            >
              {m.isDeleted ? "This message was deleted" : m.text}
            </div>

            {/* Message Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!m.isDeleted && (
                <div className="relative">
                  <button
                    onClick={() => {
                      if (!currentUser) return;
                      setActiveReactionMessage(
                        activeReactionMessage === m._id ? null : m._id,
                      );
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 shrink-0"
                    title="Add reaction"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                  {activeReactionMessage === m._id && (
                    <div
                      className={`absolute ${isCurrentUser ? "right-0" : "left-0"}  "bottom-full mb-2" flex gap-1 bg-white dark:bg-zinc-800 shadow-md border border-gray-100 dark:border-zinc-700 rounded-full p-1 z-50`}
                    >
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            if (!currentUser) return;
                            toggleReaction({
                              messageId: m._id,
                              userId: currentUser._id,
                              emoji,
                            });
                            setActiveReactionMessage(null);
                          }}
                          className="hover:bg-gray-100 dark:hover:bg-zinc-700 p-1.5 rounded-full text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {isCurrentUser && !m.isDeleted && (
                <button
                  onClick={() => {
                    if (!currentUser) return;
                    deleteMessage({
                      messageId: m._id,
                      userId: currentUser._id,
                    });
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                  title="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Reactions Display */}
          {m.reactions && m.reactions.length > 0 && (
            <div
              className={`flex flex-wrap gap-1 mt-1 ${isCurrentUser ? "justify-end mr-1" : "justify-start ml-1"}`}
            >
              {m.reactions?.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => {
                    if (!currentUser) return;
                    toggleReaction({
                      messageId: m._id,
                      userId: currentUser._id,
                      emoji: r.emoji,
                    });
                  }}
                  className={`text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                    currentUser && r.users.includes(currentUser._id)
                      ? "bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-800"
                      : "bg-gray-50 border-gray-200 dark:bg-zinc-800 dark:border-zinc-700"
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span
                    className={
                      currentUser && r.users.includes(currentUser._id)
                        ? "text-orange-700 dark:text-orange-400 font-medium"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  >
                    {r.users.length}
                  </span>
                </button>
              ))}
            </div>
          )}

          <span
            className={`text-[10px] text-gray-400 font-medium mt-1 ${isCurrentUser ? "mr-1" : "ml-1"}`}
          >
            {formatTimestamp(m.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
