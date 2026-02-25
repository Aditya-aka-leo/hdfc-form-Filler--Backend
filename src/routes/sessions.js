const { Router } = require("express");
const {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} = require("../controllers/sessionController");

const router = Router();

router.get("/", getSessions);
router.post("/", createSession);
router.patch("/:id", updateSession);
router.delete("/:id", deleteSession);

module.exports = router;
