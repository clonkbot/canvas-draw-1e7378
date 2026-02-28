import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all gallery items
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const items = await ctx.db
      .query("gallery")
      .withIndex("by_created")
      .order("desc")
      .take(50);

    // Get user info and like status for each item
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const user = await ctx.db.get(item.userId);

        let hasLiked = false;
        if (userId) {
          const like = await ctx.db
            .query("likes")
            .withIndex("by_user_and_item", (q) =>
              q.eq("userId", userId).eq("galleryItemId", item._id)
            )
            .first();
          hasLiked = !!like;
        }

        return {
          ...item,
          authorName: user?.email?.split("@")[0] || "Anonymous",
          hasLiked,
        };
      })
    );

    return itemsWithDetails;
  },
});

// Share a drawing to the gallery
export const share = mutation({
  args: {
    drawingId: v.id("drawings"),
    thumbnail: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const drawing = await ctx.db.get(args.drawingId);
    if (!drawing || drawing.userId !== userId) {
      throw new Error("Drawing not found");
    }

    // Check if already shared
    const existing = await ctx.db
      .query("gallery")
      .filter((q) => q.eq(q.field("drawingId"), args.drawingId))
      .first();

    if (existing) {
      throw new Error("Already shared");
    }

    return await ctx.db.insert("gallery", {
      drawingId: args.drawingId,
      userId,
      title: drawing.title,
      thumbnail: args.thumbnail,
      likes: 0,
      createdAt: Date.now(),
    });
  },
});

// Toggle like on a gallery item
export const toggleLike = mutation({
  args: { galleryItemId: v.id("gallery") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const galleryItem = await ctx.db.get(args.galleryItemId);
    if (!galleryItem) throw new Error("Gallery item not found");

    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_item", (q) =>
        q.eq("userId", userId).eq("galleryItemId", args.galleryItemId)
      )
      .first();

    if (existingLike) {
      await ctx.db.delete(existingLike._id);
      await ctx.db.patch(args.galleryItemId, {
        likes: Math.max(0, galleryItem.likes - 1),
      });
    } else {
      await ctx.db.insert("likes", {
        userId,
        galleryItemId: args.galleryItemId,
      });
      await ctx.db.patch(args.galleryItemId, {
        likes: galleryItem.likes + 1,
      });
    }
  },
});
