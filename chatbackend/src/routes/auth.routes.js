import express from "express";
import {
  attachUser,
  loginOrCreateUser,
  setSessionCookie,
  clearSessionCookie,
  createSessionToken,
  requirePageAuth,
} from "../auth.js";

const router = express.Router();

// Redirect root to app or login
router.get("/", (req, res) => {
  if (req.user) {
    const token = createSessionToken(req.user.id);
    res.redirect(`https://mejor-project-sigma.vercel.app/?session_token=${token}`);
  } else {
    res.redirect("/login");
  }
});

// Show login page (EJS — legacy, will be replaced by React frontend)
router.get("/login", (req, res) => {
  if (req.user) {
    const token = createSessionToken(req.user.id);
    res.redirect(`https://mejor-project-sigma.vercel.app/?session_token=${token}`);
    return;
  }
  res.render("login", { error: "", username: "" });
});

// Handle login form submission
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await loginOrCreateUser(username, password);
    setSessionCookie(res, user.id);
    const token = createSessionToken(user.id);
    res.redirect(`https://mejor-project-sigma.vercel.app/?session_token=${token}`);
  } catch (error) {
    res.status(401).render("login", {
      error: error.message,
      username,
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  clearSessionCookie(res);
  res.redirect("/login");
});

// Legacy app page
router.get("/app", requirePageAuth, (req, res) => {
  res.render("app", { user: req.user });
});

export default router;
