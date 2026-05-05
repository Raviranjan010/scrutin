const express = require('express');
const aiRoutes = require('./routes/ai.routes')
const authRoutes = require('./routes/auth.routes')
const cors = require('cors')
const session = require('express-session');
const passport = require('passport');

const app = express()

app.use(cors())


app.use(express.json())

app.use(session({ 
  secret: process.env.SESSION_SECRET || 'secret', 
  resave: false, 
  saveUninitialized: false 
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use('/auth', authRoutes)
app.use('/ai', aiRoutes)

module.exports = app