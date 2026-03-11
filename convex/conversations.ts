import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateConversation = mutation({
  args: {
    u1: v.id("users"),
    u2: v.id("users"),
  },

  handler: async (ctx, args) => {
    const conversations = await ctx.db.query("conversations").collect();

    const existing = conversations.find(
      (c) =>
        c.participants.includes(args.u1) && c.participants.includes(args.u2),
    );

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      participants: [args.u1, args.u2],
    });
  },
});

export const getUserConversations = query({
  args: { userId: v.id("users") },

  handler: async (ctx, args) => {
    const conversations = await ctx.db.query("conversations").collect();

    const filtered = conversations.filter((c) =>
      c.participants.includes(args.userId),
    );

    const results = [];

    for (const conv of filtered) {
      const otherUserId = conv.participants.find((p) => p !== args.userId);
      const otherUser = await ctx.db.get(otherUserId!);

      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
        .filter((q) => q.eq(q.field("isRead"), false))
        .collect();

      const unreadCount = unreadMessages.filter(
        (m) => m.sender !== args.userId,
      ).length;

      results.push({
        ...conv,
        otherUser,
        unreadCount,
      });
    }

    return results;
  },
});

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    typing: v.boolean(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;

    let typingUsers = conv.typingUsers || [];

    if (args.typing) {
      if (!typingUsers.includes(args.userId)) {
        typingUsers.push(args.userId);
      }
    } else {
      typingUsers = typingUsers.filter((id) => id !== args.userId);
    }

    await ctx.db.patch(args.conversationId, { typingUsers });
  },
});
