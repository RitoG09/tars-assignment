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
  }).index("by_user", ["participants"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    sender: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});
