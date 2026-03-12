require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

/* ---------------------- MongoDB Connection ---------------------- */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ---------------------- Book Schema ---------------------- */

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  author: {
    type: String,
    required: true,
  },

  isbn: {
    type: String,
    required: true,
    unique: true,
  },

  genre: {
    type: String,
    required: true,
  },

  publisher: {
    type: String,
    required: true,
  },

  publicationYear: Number,

  totalCopies: {
    type: Number,
    required: true,
    min: 1,
  },

  availableCopies: Number,

  shelfLocation: String,

  bookType: {
    type: String,
    enum: ["Reference", "Circulating"],
  },

  status: {
    type: String,
    default: "Available",
  },
});

const Book = mongoose.model("Book", bookSchema);

/* ---------------------- Routes ---------------------- */

/* Add Book */

app.post("/books", async (req, res) => {
  try {
    const book = new Book(req.body);

    const savedBook = await book.save();

    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* Get All Books */

app.get("/books", async (req, res) => {
  try {
    const books = await Book.find();

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Get Book By ID */

app.get("/books/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Update Book */

app.put("/books/:id", async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(updatedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* Delete Book */

app.delete("/books/:id", async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Search Book by Title */

app.get("/books/search", async (req, res) => {
  try {
    const title = req.query.title;

    const books = await Book.find({
      title: { $regex: title, $options: "i" },
    });

    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------------- Error Middleware ---------------------- */

app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Server Error",
    error: err.message,
  });
});

/* ---------------------- Server ---------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

