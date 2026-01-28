const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
router.use(protect({ admin: true }));
router.get("/", (req, res) => {
  res.json({
    message: "Admin area — access granted",
    admin: req.user.fullname,
    role: req.user.role,
  });
});

module.exports = router;
