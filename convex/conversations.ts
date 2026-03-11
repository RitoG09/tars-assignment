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

      results.push({
        ...conv,
        otherUser,
      });
    }

    return results;
  },
});
