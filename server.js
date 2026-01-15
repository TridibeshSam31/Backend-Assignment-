import express from "express"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()


//const authRoutes = require('./routes/auth');
//const bookingsRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
//app.use('/auth', authRoutes);
//app.use('/bookings', bookingsRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Car Rental System API',
    version: '1.0.0'
  });
});





app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});