import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Drawings table - stores each user's canvas artwork
  drawings: defineTable({
    userId: v.id("users"),
    title: v.string(),
    strokes: v.array(v.object({
      points: v.array(v.object({
        x: v.number(),
        y: v.number(),
      })),
      color: v.string(),
      size: v.number(),
    })),
    backgroundColor: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_created", ["createdAt"]),

  // Gallery - public drawings shared by users
  gallery: defineTable({
    drawingId: v.id("drawings"),
    userId: v.id("users"),
    title: v.string(),
    thumbnail: v.string(), // Base64 encoded thumbnail
    likes: v.number(),
    createdAt: v.number(),
  }).index("by_likes", ["likes"])
    .index("by_created", ["createdAt"]),

  // Likes tracking
  likes: defineTable({
    userId: v.id("users"),
    galleryItemId: v.id("gallery"),
  }).index("by_user_and_item", ["userId", "galleryItemId"]),
});
