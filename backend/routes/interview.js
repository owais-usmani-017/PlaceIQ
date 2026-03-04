const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const authMiddleware = require("../middleware/auth");

router.post(
  "/start",
  authMiddleware.protect,
  interviewController.startInterview,
);
router.post(
  "/question",
  authMiddleware.protect,
  interviewController.getQuestion,
);
router.post(
  "/evaluate",
  authMiddleware.protect,
  interviewController.evaluateSingleAnswer,
);
router.post(
  "/finish",
  authMiddleware.protect,
  interviewController.finishInterview,
);
router.get(
  "/result/:id",
  authMiddleware.protect,
  interviewController.getResult,
);
router.get(
  "/dashboard",
  authMiddleware.protect,
  interviewController.getDashboard,
);

module.exports = router;
