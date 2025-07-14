const express = require("express");
const router = express.Router();
const { Recommendation, validRecommendation, validRecommendationUpdate } = require("../models/Recommendation");
const { Notification } = require("../models/Notification");
const { Property } = require("../models/Property");
const { authToken } = require("../middlewares/authToken");
const recommendationService = require("../services/recommendationService");

// ✅ יצירת המלצה חדשה
router.post("/", authToken, async (req, res) => {
  const { error } = validRecommendation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const recommendation = await Recommendation.create(req.body);

    // שולחים התראה לליד שהומלץ לו על נכס
    const property = await Property.findById(recommendation.property_id);
    await Notification.create({
      user_id: recommendation.agent_id,
      message: `המלצה על נכס "${property?.title || "חדש"}" נרשמה לליד`,
      type: "property"
    });

    res.status(201).json(recommendation);
  } catch (err) {
    console.error("שגיאה ביצירת המלצה:", err);
    res.status(500).json({ message: "שגיאה ביצירת המלצה" });
  }
});

// ✅ שליפת כל ההמלצות (filter by agent)
router.get("/", authToken, async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ agent_id: req.tokenData.id })
      .populate("lead_id", "full_name")
      .populate("property_id", "title")
      .populate("agent_id", "full_name email");

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בשליפת המלצות" });
  }
});


/* ✅ שליפת המלצה לפי ID
router.get("/:id", authToken, async (req, res) => {
  try {
    const rec = await Recommendation.findById(req.params.id)
      .populate("lead_id", "full_name")
      .populate("property_id", "title")
      .populate("agent_id", "full_name");

    if (!rec) return res.status(404).json({ message: "המלצה לא נמצאה" });
    res.json(rec);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בשרת" });
  }
});
*/

// ✅ עדכון המלצה
router.put("/:id", authToken, async (req, res) => {
  const { error } = validRecommendationUpdate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const updated = await Recommendation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "המלצה לא נמצאה" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "שגיאה בעדכון המלצה" });
  }
});

// ✅ מחיקת המלצה
router.delete("/:id", authToken, async (req, res) => {
  try {
    const deleted = await Recommendation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "המלצה לא נמצאה" });
    res.json({ message: "המלצה נמחקה" });
  } catch (err) {
    res.status(500).json({ message: "שגיאה במחיקת המלצה" });
  }
});

// Generate recommendations for a lead
router.post('/generate/:leadId', authToken, async (req, res) => {
  try {
    const recommendations = await recommendationService.generateRecommendations(req.params.leadId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recommendations for a lead
router.get('/lead/:leadId', authToken, async (req, res) => {
  try {
    const recommendations = await recommendationService.getLeadRecommendations(req.params.leadId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update recommendation status
router.put('/:id/status', authToken, async (req, res) => {
  try {
    const { status } = req.body;
    const recommendation = await recommendationService.updateRecommendationStatus(req.params.id, status);
    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
