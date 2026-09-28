const express = require('express');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const books = require('./booksdb.js');
const { isValid, users } = require('./auth_users.js');

const public_users = express.Router();

// Register a user with a hashed password.
public_users.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Username and password are required.'
      });
    }

    const normalizedUsername = username.trim();

    if (Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({
        message: 'Password must not exceed 72 UTF-8 bytes.'
      });
    }

    if (isValid(normalizedUsername)) {
      return res.status(409).json({
        message: 'Username already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Recheck after hashing to handle concurrent registrations.
    if (isValid(normalizedUsername)) {
      return res.status(409).json({
        message: 'Username already exists.'
      });
    }

    users.push({ username: normalizedUsername, passwordHash });

    return res.status(201).json({
      message: 'User registered successfully.',
      username: normalizedUsername
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Registration failed.'
    });
  }
});

// Get all books from the original IBM data source.
public_users.get('/', (req, res) => {
  return res.status(200).json(books);
});

// Get a book by its ISBN key.
public_users.get('/isbn/:isbn', (req, res) => {
  if (!Object.hasOwn(books, req.params.isbn)) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  return res.status(200).json(books[req.params.isbn]);
});

// Find books by author or title, ignoring letter case.
const findBooks = (field, search) => {
  const term = search.trim().toLowerCase();

  return Object.fromEntries(
    Object.entries(books).filter(([, book]) =>
      book[field].toLowerCase().includes(term)
    )
  );
};

public_users.get('/author/:author', (req, res) => {
  const matches = findBooks('author', req.params.author);

  if (Object.keys(matches).length === 0) {
    return res.status(404).json({ message: 'No books found.' });
  }

  return res.status(200).json(matches);
});

public_users.get('/title/:title', (req, res) => {
  const matches = findBooks('title', req.params.title);

  if (Object.keys(matches).length === 0) {
    return res.status(404).json({ message: 'No books found.' });
  }

  return res.status(200).json(matches);
});

// Get the reviews for a specific book.
public_users.get('/review/:isbn', (req, res) => {
  if (!Object.hasOwn(books, req.params.isbn)) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  return res.status(200).json(books[req.params.isbn].reviews);
});

// Task 11: asynchronous HTTP queries using Axios.
// These functions call the running API and return its response data.
// Rejections propagate to the caller for error handling.
const bookClient = axios.create({
  baseURL: process.env.BOOK_API_URL ||
    `http://127.0.0.1:${process.env.PORT || 5000}`,
  timeout: 5000
});

async function getAllBooks() {
  const response = await bookClient.get('/');
  return response.data;
}

async function getBooksByISBN(isbn) {
  const response = await bookClient.get(
    `/isbn/${encodeURIComponent(isbn)}`
  );
  return response.data;
}

async function getBooksByAuthor(author) {
  const response = await bookClient.get(
    `/author/${encodeURIComponent(author)}`
  );
  return response.data;
}

async function getBooksByTitle(title) {
  const response = await bookClient.get(
    `/title/${encodeURIComponent(title)}`
  );
  return response.data;
}

module.exports = {
  general: public_users,
  getAllBooks,
  getBooksByISBN,
  getBooksByAuthor,
  getBooksByTitle
};
