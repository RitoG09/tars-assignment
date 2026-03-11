"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function ChatWindow({ conversationId, currentUser }: any) {
  const messages = useQuery(api.messages.getMessages, {
    conversationId,
  });

  const sendMessage = useMutation(api.messages.sendMessage);

  const [text, setText] = useState("");

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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages?.map((m) => (
          <div
            key={m._id}
            className={`p-2 rounded-md max-w-xs ${
              m.sender === currentUser._id
                ? "ml-auto bg-orange-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-md p-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />

        <button
          className="px-4 py-2 bg-orange-500 text-white rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
