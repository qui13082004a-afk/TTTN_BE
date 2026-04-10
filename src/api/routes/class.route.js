const express = require("express");
const router = express.Router();
const classController = require("../controllers/class.controller");

// Create class
router.post("/", classController.createClass);

// Get all classes
router.get("/", classController.getAllClasses);

// Search by class name (đặt trước /:id để tránh conflict)
router.get("/search/class", classController.searchByClassName);

// Search by lecturer name (đặt trước /:id để tránh conflict)
router.get("/search/lecturer", classController.searchByLecturerName);

// Get classes by lecturer
router.get("/lecturer/:id_giang_vien", classController.getClassesByLecturer);

// Get class by ID
router.get("/:id", classController.getClassById);

// Update class
router.patch("/:id", classController.updateClass);

// Delete class
router.delete("/:id", classController.deleteClass);

module.exports = router;