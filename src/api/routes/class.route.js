const express = require("express");
const router = express.Router();
const classController = require("../controllers/class.controller");

// Create class
router.post("/", classController.createClass);

// Get all classes
router.get("/", classController.getAllClasses);

// Get class by ID
router.get("/:id", classController.getClassById);

// Get classes by lecturer
router.get("/lecturer/:id_giang_vien", classController.getClassesByLecturer);

// Update class
router.put("/:id", classController.updateClass);

// Delete class
router.delete("/:id", classController.deleteClass);

module.exports = router;