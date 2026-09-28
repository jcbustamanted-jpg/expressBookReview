const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const books = require('./booksdb.js');

const regd_users = express.Router();
const users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = async (username, password) => {
  const user = users.find((item) => item.username === username);
  if (!user) return false;

  return bcrypt.compare(password, user.passwordHash);
};

// Log in a registered user.
regd_users.post('/login', async (req, res) => {
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
    const authenticated = await authenticatedUser(
      normalizedUsername,
      password
    );

    if (!authenticated) {
      return res.status(401).json({
        message: 'Invalid username or password.'
      });
    }

    const accessToken = jwt.sign(
      { username: normalizedUsername },
      req.app.locals.jwtSecret,
      { expiresIn: '1h' }
    );

    req.session.regenerate((error) => {
      if (error) {
        return res.status(500).json({
          message: 'Could not create session.'
        });
      }

      req.session.authorization = { accessToken };

      req.session.save((saveError) => {
        if (saveError) {
          return res.status(500).json({
            message: 'Could not save session.'
          });
        }

        return res.status(200).json({
          message: 'Login successful.',
          username: normalizedUsername
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

// Add or update only the authenticated user's review.
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  if (!Object.hasOwn(books, isbn)) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  const review = req.body?.review ?? req.query.review;

  if (typeof review !== 'string' || !review.trim()) {
    return res.status(400).json({
      message: 'A non-empty review is required.'
    });
  }

  const username = req.user.username;
  const reviews = books[isbn].reviews;
  const existed = Object.hasOwn(reviews, username);

  Object.defineProperty(reviews, username, {
    value: review.trim(),
    enumerable: true,
    writable: true,
    configurable: true
  });

  return res.status(200).json({
    message: existed
      ? 'Review updated successfully.'
      : 'Review added successfully.',
    isbn,
    reviews
  });
});

// Delete only the authenticated user's review.
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;

  if (!Object.hasOwn(books, isbn)) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  const username = req.user.username;
  const reviews = books[isbn].reviews;

  if (!Object.hasOwn(reviews, username)) {
    return res.status(404).json({
      message: 'You have no review for this book.'
    });
  }

  delete reviews[username];

  return res.status(200).json({
    message: 'Review deleted successfully.',
    isbn,
    reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
