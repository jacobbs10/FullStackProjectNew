const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware');

// User registration
router.post('/register', async (req, res) => {
    try {
        const { 
            firstname, 
            lastname, 
            email, 
            usertype, 
            username, 
            password,
            birthdate,    // Added new required field
            preferences   // Added optional field
        } = req.body; 

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = new User({ 
            firstname, 
            lastname, 
            email, 
            usertype, 
            username, 
            password: hashedPassword,
            birthdate,    // Include birthdate
            preferences: preferences || { pagesize: 10 }  // Set default if not provided
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error); // Add error logging
        res.status(500).json({ 
            error: 'Registration failed',
            details: error.message  // Include error details for debugging
        });
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        //console.log(`user: ${username} pass: ${password}`)
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Authentication failed' });
        }
        const token = jwt.sign({ userId: user._id }, 'A-Wonderfull-World-Key', {
            expiresIn: '1h',
        });
        const nameOfUser = `${user.firstname} ${user.lastname}`;
        res.status(200).json({ 
            token: token, 
            name: nameOfUser,
            username: user.username,
            userType: user.usertype,
            pagesize: user.preferences?.pagesize || 10  // Add pagesize to response
        });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// User registration
router.post('/bulkRegister', verifyToken , async (req, res) => {
    try {
        const users = req.body;
        
        if (!Array.isArray(users)) {
            return res.status(400).json({ error: 'Request body must be an array of users' });
        }

        const registeredUsers = [];
        const errors = [];
        for (const userData of users) {
            try {
                const { 
                    firstname, 
                    lastname, 
                    email, 
                    usertype, 
                    username, 
                    password, 
                    birthdate,
                    preferences
                } = userData;                

                // Hash password for each user
                const hashedPassword = await bcrypt.hash(password, 10);                
                
                // Create new user object with all fields
                const user = new User({
                    firstname,
                    lastname,
                    email,
                    usertype,
                    username,
                    password: hashedPassword,
                    birthdate,
                    preferences: preferences || { pagesize: 10 }
                });

                // Save user to database
                await user.save();
                registeredUsers.push(username);
            } catch (error) {
                // Keep track of failed registrations
                errors.push({
                    username: userData.username,
                    error: error.message
                });
            }
        }
        // Return results
        res.status(201).json({
            success: {
                count: registeredUsers.length,
                users: registeredUsers
            },
            failures: {
                count: errors.length,
                errors: errors
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Bulk registration failed', details: error.message });
    }
});

router.post("/updatepass", verifyToken, async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ error: "Username and password are required" });
    }
    try {        
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Only update the password field
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { $set: { password: hashedPassword } },
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        
        res.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// Add this new route for password verification
router.post("/verify-password", verifyToken, async (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).json({ 
            error: "Username and current password are required" 
        });
    }

    try {
        const { username, password } = req.body;
        
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ 
                error: "User not found" 
            });
        }

        // Verify the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ 
                error: "Current password is incorrect" 
            });
        }

        // Password is correct
        res.json({ 
            message: "Password verified successfully" 
        });

    } catch (error) {
        console.error("Error verifying password:", error);
        res.status(500).json({ 
            error: "Server error during password verification" 
        });
    }
});

module.exports = router;