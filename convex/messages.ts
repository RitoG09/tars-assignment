import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    sender: v.id("users"),
    text: v.string(),
  },

  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
    });
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.text,
      lastMessageTime: Date.now(),
    });
  },
});

export const getMessages = query({
  args: { conversationId: v.id("conversations") },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();
  },
});
