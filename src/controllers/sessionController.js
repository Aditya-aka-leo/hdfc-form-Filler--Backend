const Session = require("../models/Session");

// GET /api/v1/sessions?pathname=<path>
async function getSessions(req, res) {
  const { pathname } = req.query;

  if (!pathname) {
    return res.status(400).json({ error: "pathname query param is required" });
  }

  const sessions = await Session.find({ pathname, isPublic: true })
    .sort({ savedAt: -1 })
    .lean();

  return res.json({ sessions });
}

// POST /api/v1/sessions
async function createSession(req, res) {
  const { id, label, savedAt, pathname, data, excluded, createdBy, steps } = req.body;

  // Manual required-field checks (gives clearer messages than Mongoose alone)
  const missing = ["id", "label", "savedAt", "pathname", "data", "createdBy"].filter(
    (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ""
  );
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(", ")}` });
  }

  const session = new Session({
    id,
    label,
    savedAt,
    pathname,
    data,
    excluded: excluded ?? [],
    steps: Array.isArray(steps) ? steps : [],
    createdBy,
    isPublic: true,
  });

  await session.save();
  return res.status(201).json({ session: session.toObject() });
}

// PATCH /api/v1/sessions/:id
async function updateSession(req, res) {
  const { id } = req.params;
  const { excluded } = req.body;

  if (!Array.isArray(excluded)) {
    return res.status(400).json({ error: "excluded must be an array of strings" });
  }

  const session = await Session.findOneAndUpdate(
    { id },
    { excluded },
    { new: true, runValidators: true }
  ).lean();

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  return res.json({ session });
}

// DELETE /api/v1/sessions/:id
async function deleteSession(req, res) {
  const { id } = req.params;

  const result = await Session.findOneAndDelete({ id });

  if (!result) {
    return res.status(404).json({ error: "Session not found" });
  }

  return res.json({ ok: true });
}

module.exports = { getSessions, createSession, updateSession, deleteSession };
