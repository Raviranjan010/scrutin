const express = require('express');
const aiRoutes = require('./routes/ai.routes')
const authRoutes = require('./routes/auth.routes')
const reviewRoutes = require('./routes/review.routes')
const cors = require('cors')
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express()
app.set('trust proxy', 1)
 
 // Validation for required production environment variables
 function validateEnv() {
   const isProd = process.env.NODE_ENV === 'production';
   const required = [
     'GOOGLE_GEMINI_KEY',
     'JWT_SECRET',
     'SESSION_SECRET'
   ];
 
   if (isProd) {
     required.push('MONGODB_URI', 'FRONTEND_URL', 'BACKEND_URL');
   }
 
   const missing = required.filter(key => !process.env[key]);
 
   if (missing.length > 0) {
     console.error('FATAL: Missing required environment variables:');
     missing.forEach(key => console.error(` - ${key}`));
     if (isProd) {
       process.exit(1);
     } else {
       console.warn('Backend will run with limited functionality.');
     }
   }
 }
 
 validateEnv();

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be set in production.');
    }
    return 'dev_session_secret';
  }
  return secret;
}

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}))

app.use(helmet())
app.use(compression())

app.use(express.json())

app.use(session({ 
  secret: getSessionSecret(), 
  resave: false, 
  saveUninitialized: false,
  cookie: {
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

app.get('/health', (req, res) => {
    res.json({ status: "ok", version: "1.0.0" })
})

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use('/auth', authRoutes)
app.use('/ai', aiLimiter, aiRoutes)
app.use('/reviews', reviewRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

module.exports = app
