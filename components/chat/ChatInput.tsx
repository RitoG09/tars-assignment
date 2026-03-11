import { useState, useRef, useEffect } from "react";
import { SendIcon, RefreshCcw } from "lucide-react";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ChatInputProps {
  conversationId: Id<"conversations">;
  currentUser: Doc<"users"> | null | undefined;
}

export function ChatInput({ conversationId, currentUser }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useMutation(api.messages.sendMessage);
  const setTyping = useMutation(api.conversations.setTyping);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSend = async () => {
    if (!text.trim() || isSending || !currentUser) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTyping({ conversationId, typing: false, userId: currentUser._id });

    setIsSending(true);
    setError(null);

    try {
      await sendMessage({
        conversationId,
        sender: currentUser._id,
        text,
      });
      setText("");
    } catch (err) {
      console.error("Failed to send message", err);
      setError("Failed to send. Click to retry.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-gray-200/50 dark:border-white/5 relative z-10 shrink-0">
      <form
        className="flex items-center gap-2 max-w-4xl mx-auto relative"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        {error && (
          <div className="absolute -top-10 left-0 right-0 flex justify-center animate-in slide-in-from-bottom-2 fade-in">
            <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
              <span>{error}</span>
              <button
                type="button"
                onClick={handleSend}
                className="font-medium underline hover:text-red-100 flex items-center gap-1"
              >
                <RefreshCcw className="h-3 w-3" /> Retry
              </button>
            </div>
          </div>
        )}
        <input
          className="flex-1 bg-white dark:bg-[#2a3942] text-[#111b21] dark:text-[#e9edef] border border-black/5 dark:border-none rounded-full px-5 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium disabled:opacity-50"
          value={text}
          disabled={isSending}
          onChange={(e) => {
            setText(e.target.value);
            if (currentUser) {
              setTyping({
                conversationId,
                typing: true,
                userId: currentUser._id,
              });
            }
            if (typingTimeoutRef.current)
              clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
              if (currentUser) {
                setTyping({
                  conversationId,
                  typing: false,
                  userId: currentUser._id,
                });
              }
            }, 2000);
          }}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          disabled={!text.trim() || isSending}
          className="absolute right-1.5 p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-full transition-colors flex items-center justify-center shadow-sm"
        >
          {isSending ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <SendIcon className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
}
