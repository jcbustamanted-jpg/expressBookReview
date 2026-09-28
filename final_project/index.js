const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const crypto = require('crypto');

const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
const PORT = process.env.PORT || 5000;

app.locals.jwtSecret = process.env.JWT_SECRET ||
  crypto.randomBytes(32).toString('hex');

const sessionSecret = process.env.SESSION_SECRET ||
  crypto.randomBytes(32).toString('hex');

app.disable('x-powered-by');
app.set('json spaces', 2);
app.use(express.json({ limit: '16kb' }));

app.use('/customer', session({
  name: 'bookreview.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 60 * 60 * 1000
  }
}));

// Protect all review changes with the login session and JWT.
app.use('/customer/auth', (req, res, next) => {
  const token = req.session.authorization?.accessToken;

  if (!token) {
    return res.status(401).json({
      message: 'Please log in first.'
    });
  }

  try {
    const payload = jwt.verify(token, app.locals.jwtSecret, {
      algorithms: ['HS256']
    });

    req.user = { username: payload.username };
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired session. Please log in again.'
    });
  }
});

app.use('/customer', customerRoutes);
app.use('/', generalRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body.' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large.' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
