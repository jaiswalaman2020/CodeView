import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// export const syncUser = mutation({
//   args: {
//     name: v.string(),
//     email: v.string(),
//     clerkId: v.string(),
//     image: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     let existingUser = await ctx.db
//       .query("users")
//       .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
//       .first();

//     if (existingUser) return;

//     return await ctx.db.insert("users", {
//       ...args,
//       role: "candidate",
//     });
//   },
// });

export const syncUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check by clerkId
    let existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    // If not found, check by email
    if (!existingUser) {
      existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), args.email))
        .first();
    }

    // If user exists, optionally update info, else insert
    if (existingUser) {
      // Optionally update user info here if needed
      return;
    }

    return await ctx.db.insert("users", {
      ...args,
      role: "candidate",
    });
  },
});

export const getUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User is not authenticated");

    const users = await ctx.db.query("users").collect();

    return users;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});
