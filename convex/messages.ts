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
      isRead: false,
    });
    const conv = await ctx.db.get(args.conversationId);
    let typingUsers = conv?.typingUsers || [];
    typingUsers = typingUsers.filter((u) => u !== args.sender);

    await ctx.db.patch(args.conversationId, {
      lastMessage: args.text,
      lastMessageTime: Date.now(),
      typingUsers,
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

export const markRead = mutation({
  args: { conversationId: v.id("conversations"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const msg of unreadMessages) {
      if (msg.sender !== args.userId) {
        await ctx.db.patch(msg._id, { isRead: true });
      }
    }
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");
    if (msg.sender !== args.userId) {
      throw new Error("Unauthorized to delete this message");
    }

    await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg) throw new Error("Message not found");

    const reactions = msg.reactions || [];
    const existingReactionIndex = reactions.findIndex(
      (r) => r.emoji === args.emoji,
    );

    if (existingReactionIndex !== -1) {
      const existingReaction = reactions[existingReactionIndex];
      const userIndex = existingReaction.users.indexOf(args.userId);

      if (userIndex !== -1) {
        existingReaction.users.splice(userIndex, 1);
        if (existingReaction.users.length === 0) {
          reactions.splice(existingReactionIndex, 1);
        }
      } else {
        existingReaction.users.push(args.userId);
      }
    } else {
      reactions.push({ emoji: args.emoji, users: [args.userId] });
    }

    await ctx.db.patch(args.messageId, { reactions });
  },
});
