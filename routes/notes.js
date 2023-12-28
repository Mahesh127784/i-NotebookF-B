const express = require("express");
const router = express.Router();
const fetchuser = require("../middlewares/fetchuser");
const Note = require("../models/Notes");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

// Get all the notes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.userId });
    res.send(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(`Internal server error`);
  }
});

//Create a new note
const validateNotesCreation = [
  body("title", "Please enter a valid title").isLength({ min: 2 }),
  body(
    "description",
    "Please enter a description of min 5 characters"
  ).isLength({ min: 5 }),
];
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
router.post(
  "/createnote",
  validateNotesCreation,
  handleValidationErrors,
  fetchuser,
  async (req, res) => {
    try {
      const user = req.userId;
      const note = new Note({
        user: user,
        title: req.body.title,
        description: req.body.description,
        tags: req.body.tags,
      });
      await note.save();
      res.json(note);
    } catch (error) {
      console.error(error.message);
      res.status(500).send(`Internal server error`);
    }
  }
);

//update an existing note
router.put("/noteupdate/:id", fetchuser, async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    let updtnote = {};
    if (title) {
      updtnote.title = title;
    }
    if (description) {
      updtnote.description = description;
    }
    if (tags) {
      updtnote.tags = tags;
    }
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(400).json({ error: "Could not find the note!!!..." });
    }
    const user = req.userId;
    console.log(user);
    if (note.user.toString() !== user) {
      return res.status(400).json({ error: "Could not find the note!!!" });
    }
    const newnote = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: updtnote },
      { new: true }
    );
    newnote.save();
    res.send(newnote);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(`Internal server error`);
  }
});

//delete the note
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(400).json({ error: "Could not find the note!!!" });
    }

    const user = req.userId;
    if (note.user.toString() !== user) {
      return res.status(400).json({ error: "Could not find the note!!!" });
    }

    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: "Note deleted successfully", note: note });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(`Internal server error`);
  }
});

module.exports = router;
