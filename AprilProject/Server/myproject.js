const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require('./routes/auth');
const userActRoutes = require('./routes/userActivities');
const productRoutes = require('./routes/productRoutes');

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000", // Your React app's URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes
app.use('/auth', authRoutes);
app.use('/userAct', userActRoutes);
app.use('/api', productRoutes);


// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1); // Exit process with failure
    }
}

// Start server
const PORT = process.env.PORT || 8000;
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startServer();
