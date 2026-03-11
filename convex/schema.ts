import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    isOnline: v.optional(v.boolean()),
  }).index("by_clerk_id", ["clerkId"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    lastMessage: v.optional(v.string()),
    lastMessageTime: v.optional(v.number()),
    typingUsers: v.optional(v.array(v.id("users"))),
  }).index("by_user", ["participants"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    sender: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
    isRead: v.optional(v.boolean()),
    isDeleted: v.optional(v.boolean()),
    reactions: v.optional(
      v.array(
        v.object({
          emoji: v.string(),
          users: v.array(v.id("users")),
        }),
      ),
    ),
  }).index("by_conversation", ["conversationId"]),
});
