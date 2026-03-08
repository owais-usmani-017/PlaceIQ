require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');

const app = express();

connectDB();

app.use(
  cors({
    origin: "https://place-iq-know-before-you-get-placed.vercel.app",
    credentials: true,
  }),
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

app.get('/', (req, res) => res.json({ message: 'PlaceIQ API is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));