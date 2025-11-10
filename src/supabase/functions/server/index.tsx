import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-90e9685c/health", (c) => {
  return c.json({ status: "ok" });
});

// AUTH ROUTES
// Sign up new host
app.post("/make-server-90e9685c/auth/signup", async (c) => {
  try {
    const { phone, name, email, hostType } = await c.req.json();
    
    if (!phone || !name || !hostType) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Check if user already exists
    const existingUser = await kv.get(`user:${phone}`);
    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      phone,
      name,
      email: email || "",
      hostType, // "travel" or "service"
      kycVerified: false,
      createdAt: new Date().toISOString(),
      profileComplete: false,
    };

    await kv.set(`user:${phone}`, user);
    await kv.set(`user:id:${userId}`, user);

    console.log(`User signed up: ${userId}`);
    return c.json({ success: true, user });
  } catch (error) {
    console.error("Error in signup:", error);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// Login with OTP (simplified - in production use actual OTP service)
app.post("/make-server-90e9685c/auth/login", async (c) => {
  try {
    const { phone, otp } = await c.req.json();
    
    if (!phone) {
      return c.json({ error: "Phone number required" }, 400);
    }

    const user = await kv.get(`user:${phone}`);
    if (!user) {
      return c.json({ error: "User not found. Please sign up first." }, 404);
    }

    // In production, verify actual OTP here
    // For demo, accept any 4-digit code
    if (otp && otp.length === 4) {
      return c.json({ success: true, user });
    }

    return c.json({ error: "Invalid OTP" }, 400);
  } catch (error) {
    console.error("Error in login:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Request OTP (demo - just returns success)
app.post("/make-server-90e9685c/auth/request-otp", async (c) => {
  try {
    const { phone } = await c.req.json();
    
    const user = await kv.get(`user:${phone}`);
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // In production, send actual OTP via WhatsApp/SMS
    console.log(`OTP requested for ${phone}`);
    return c.json({ success: true, message: "OTP sent to your WhatsApp" });
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return c.json({ error: "Failed to send OTP" }, 500);
  }
});

// CONTEST ENTRY ROUTES
// Submit contest entry
app.post("/make-server-90e9685c/entries", async (c) => {
  try {
    const { userId, title, description, mediaUrls, category } = await c.req.json();
    
    if (!userId || !title || !description || !mediaUrls || mediaUrls.length === 0) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const entryId = crypto.randomUUID();
    const entry = {
      id: entryId,
      userId,
      title,
      description,
      mediaUrls,
      category: category || "general",
      uploadedAt: new Date().toISOString(),
      totalVotes: 0,
      juryScore: 0,
      overallScore: 0,
      status: "pending", // pending, approved, rejected
    };

    await kv.set(`entry:${entryId}`, entry);
    
    // Add to user's entries
    const userEntries = await kv.get(`user:${userId}:entries`) || [];
    userEntries.push(entryId);
    await kv.set(`user:${userId}:entries`, userEntries);

    // Add to all entries list
    const allEntries = await kv.get("entries:all") || [];
    allEntries.push(entryId);
    await kv.set("entries:all", allEntries);

    console.log(`Entry created: ${entryId} by user ${userId}`);
    return c.json({ success: true, entry });
  } catch (error) {
    console.error("Error creating entry:", error);
    return c.json({ error: "Failed to create entry" }, 500);
  }
});

// Get all approved entries
app.get("/make-server-90e9685c/entries", async (c) => {
  try {
    const entryIds = await kv.get("entries:all") || [];
    const entries = [];

    for (const id of entryIds) {
      const entry = await kv.get(`entry:${id}`);
      if (entry && entry.status === "approved") {
        // Get user info
        const user = await kv.get(`user:id:${entry.userId}`);
        entries.push({
          ...entry,
          hostName: user?.name || "Unknown",
          hostType: user?.hostType || "travel",
        });
      }
    }

    // Sort by overall score
    entries.sort((a, b) => b.overallScore - a.overallScore);

    return c.json({ success: true, entries });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return c.json({ error: "Failed to fetch entries" }, 500);
  }
});

// Get single entry
app.get("/make-server-90e9685c/entries/:id", async (c) => {
  try {
    const entryId = c.req.param("id");
    const entry = await kv.get(`entry:${entryId}`);
    
    if (!entry) {
      return c.json({ error: "Entry not found" }, 404);
    }

    const user = await kv.get(`user:id:${entry.userId}`);
    
    return c.json({ 
      success: true, 
      entry: {
        ...entry,
        hostName: user?.name || "Unknown",
        hostType: user?.hostType || "travel",
        hostEmail: user?.email || "",
      }
    });
  } catch (error) {
    console.error("Error fetching entry:", error);
    return c.json({ error: "Failed to fetch entry" }, 500);
  }
});

// Get user's entries
app.get("/make-server-90e9685c/users/:userId/entries", async (c) => {
  try {
    const userId = c.req.param("userId");
    const entryIds = await kv.get(`user:${userId}:entries`) || [];
    const entries = [];

    for (const id of entryIds) {
      const entry = await kv.get(`entry:${id}`);
      if (entry) {
        entries.push(entry);
      }
    }

    return c.json({ success: true, entries });
  } catch (error) {
    console.error("Error fetching user entries:", error);
    return c.json({ error: "Failed to fetch entries" }, 500);
  }
});

// VOTING ROUTES
// Submit public vote
app.post("/make-server-90e9685c/votes", async (c) => {
  try {
    const { entryId, voterId } = await c.req.json();
    
    if (!entryId || !voterId) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Check if already voted
    const voteKey = `vote:${entryId}:${voterId}`;
    const existingVote = await kv.get(voteKey);
    
    if (existingVote) {
      return c.json({ error: "You have already voted for this entry" }, 400);
    }

    // Record vote
    await kv.set(voteKey, {
      entryId,
      voterId,
      votedAt: new Date().toISOString(),
    });

    // Update entry vote count
    const entry = await kv.get(`entry:${entryId}`);
    if (entry) {
      entry.totalVotes = (entry.totalVotes || 0) + 1;
      // Recalculate overall score (60% jury, 40% public votes)
      entry.overallScore = (entry.juryScore * 0.6) + (entry.totalVotes * 0.4);
      await kv.set(`entry:${entryId}`, entry);
    }

    console.log(`Vote recorded: ${voterId} voted for ${entryId}`);
    return c.json({ success: true, totalVotes: entry.totalVotes });
  } catch (error) {
    console.error("Error recording vote:", error);
    return c.json({ error: "Failed to record vote" }, 500);
  }
});

// Check if user has voted
app.get("/make-server-90e9685c/votes/:entryId/:voterId", async (c) => {
  try {
    const entryId = c.req.param("entryId");
    const voterId = c.req.param("voterId");
    
    const voteKey = `vote:${entryId}:${voterId}`;
    const vote = await kv.get(voteKey);
    
    return c.json({ success: true, hasVoted: !!vote });
  } catch (error) {
    console.error("Error checking vote:", error);
    return c.json({ error: "Failed to check vote" }, 500);
  }
});

// JURY SCORING ROUTES
// Submit jury score
app.post("/make-server-90e9685c/jury/score", async (c) => {
  try {
    const { entryId, juryId, score, feedback } = await c.req.json();
    
    if (!entryId || !juryId || score === undefined) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (score < 0 || score > 100) {
      return c.json({ error: "Score must be between 0 and 100" }, 400);
    }

    const scoreKey = `jury:${entryId}:${juryId}`;
    await kv.set(scoreKey, {
      entryId,
      juryId,
      score,
      feedback: feedback || "",
      scoredAt: new Date().toISOString(),
    });

    // Update entry's jury score (average of all jury scores)
    const entry = await kv.get(`entry:${entryId}`);
    if (entry) {
      // Get all jury scores for this entry
      const juryScoresPrefix = `jury:${entryId}:`;
      const allScores = await kv.getByPrefix(juryScoresPrefix);
      
      const totalScore = allScores.reduce((sum, s) => sum + s.score, 0);
      entry.juryScore = allScores.length > 0 ? totalScore / allScores.length : 0;
      
      // Recalculate overall score (60% jury, 40% public votes)
      entry.overallScore = (entry.juryScore * 0.6) + ((entry.totalVotes || 0) * 0.4);
      await kv.set(`entry:${entryId}`, entry);
    }

    console.log(`Jury score recorded: ${juryId} scored ${entryId} with ${score}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Error recording jury score:", error);
    return c.json({ error: "Failed to record score" }, 500);
  }
});

// LEADERBOARD
app.get("/make-server-90e9685c/leaderboard", async (c) => {
  try {
    const limit = parseInt(c.req.query("limit") || "50");
    const category = c.req.query("category");
    
    const entryIds = await kv.get("entries:all") || [];
    const entries = [];

    for (const id of entryIds) {
      const entry = await kv.get(`entry:${id}`);
      if (entry && entry.status === "approved") {
        if (!category || entry.category === category) {
          const user = await kv.get(`user:id:${entry.userId}`);
          entries.push({
            id: entry.id,
            title: entry.title,
            hostName: user?.name || "Unknown",
            hostType: user?.hostType || "travel",
            totalVotes: entry.totalVotes || 0,
            juryScore: entry.juryScore || 0,
            overallScore: entry.overallScore || 0,
            mediaUrls: entry.mediaUrls,
          });
        }
      }
    }

    // Sort by overall score
    entries.sort((a, b) => b.overallScore - a.overallScore);

    return c.json({ 
      success: true, 
      leaderboard: entries.slice(0, limit),
      total: entries.length,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return c.json({ error: "Failed to fetch leaderboard" }, 500);
  }
});

// ADMIN ROUTES
// Approve/Reject entry
app.put("/make-server-90e9685c/admin/entries/:id/status", async (c) => {
  try {
    const entryId = c.req.param("id");
    const { status } = await c.req.json();
    
    if (!["approved", "rejected", "pending"].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    const entry = await kv.get(`entry:${entryId}`);
    if (!entry) {
      return c.json({ error: "Entry not found" }, 404);
    }

    entry.status = status;
    await kv.set(`entry:${entryId}`, entry);

    console.log(`Entry ${entryId} status updated to ${status}`);
    return c.json({ success: true, entry });
  } catch (error) {
    console.error("Error updating entry status:", error);
    return c.json({ error: "Failed to update status" }, 500);
  }
});

// Get all entries (including pending) for admin
app.get("/make-server-90e9685c/admin/entries", async (c) => {
  try {
    const entryIds = await kv.get("entries:all") || [];
    const entries = [];

    for (const id of entryIds) {
      const entry = await kv.get(`entry:${id}`);
      if (entry) {
        const user = await kv.get(`user:id:${entry.userId}`);
        entries.push({
          ...entry,
          hostName: user?.name || "Unknown",
          hostType: user?.hostType || "travel",
        });
      }
    }

    // Sort by upload date (newest first)
    entries.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return c.json({ success: true, entries });
  } catch (error) {
    console.error("Error fetching admin entries:", error);
    return c.json({ error: "Failed to fetch entries" }, 500);
  }
});

Deno.serve(app.fetch);