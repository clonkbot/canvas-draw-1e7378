import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all drawings for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("drawings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get a single drawing
export const get = query({
  args: { id: v.id("drawings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const drawing = await ctx.db.get(args.id);
    if (!drawing || drawing.userId !== userId) return null;

    return drawing;
  },
});

// Create a new drawing
export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("drawings", {
      userId,
      title: args.title,
      strokes: args.strokes,
      backgroundColor: args.backgroundColor,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing drawing
export const update = mutation({
  args: {
    id: v.id("drawings"),
    title: v.optional(v.string()),
    strokes: v.optional(v.array(v.object({
      points: v.array(v.object({
        x: v.number(),
        y: v.number(),
      })),
      color: v.string(),
      size: v.number(),
    }))),
    backgroundColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const drawing = await ctx.db.get(args.id);
    if (!drawing || drawing.userId !== userId) {
      throw new Error("Drawing not found");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) updates.title = args.title;
    if (args.strokes !== undefined) updates.strokes = args.strokes;
    if (args.backgroundColor !== undefined) updates.backgroundColor = args.backgroundColor;

    await ctx.db.patch(args.id, updates);
  },
});

// Delete a drawing
export const remove = mutation({
  args: { id: v.id("drawings") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const drawing = await ctx.db.get(args.id);
    if (!drawing || drawing.userId !== userId) {
      throw new Error("Drawing not found");
    }

    // Also remove from gallery if shared
    const galleryItem = await ctx.db
      .query("gallery")
      .filter((q) => q.eq(q.field("drawingId"), args.id))
      .first();

    if (galleryItem) {
      // Remove all likes for this gallery item
      const likes = await ctx.db
        .query("likes")
        .withIndex("by_user_and_item", (q) => q.eq("userId", userId).eq("galleryItemId", galleryItem._id))
        .collect();

      for (const like of likes) {
        await ctx.db.delete(like._id);
      }

      await ctx.db.delete(galleryItem._id);
    }

    await ctx.db.delete(args.id);
  },
});
