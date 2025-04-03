const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

router.get('/users', verifyToken , async (req, res) => {
    try {
         // Get pagination parameters from query string
         const size = parseInt(req.query.size) || 12;
         const page = parseInt(req.query.page) || 1;

          // Validate parameters
        if (size < 1 || page < 1) {
            return res.status(400).json({ 
                message: "Size and page parameters must be positive integers" 
            });
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * size;

        // Get total count of products
        const totalCount = await User.countDocuments({});

        // Get products with pagination
        const users = await User.find({})
            .skip(skip)
            .limit(size);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / size);

        res.json({
            users: users,
            pagination: {
                total: totalCount,
                pageSize: size,
                currentPage: page,
                totalPages: totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
        
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Server error");
    }
});
router.get("/user/:id", verifyToken , async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findOne({ username: userId });
        console.log(user);
        
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.send(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Server error");
    }   
});

router.post("/user", verifyToken , async (req, res) => {
    if (!req.body || !req.body.username) {
        return res.status(400).send("Bad request");
    }
    try {
        const userId = req.body.username;
        console.log(userId);
        const user = await User.findOne({ username: userId });
        console.log(user);
        const updateData = {
            $set: { 
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                usertype: req.body.usertype,
                birthdate: req.body.birthdate,
                preferences: req.body.preferences
            }
        };

        const updatedUser = await User.findOneAndUpdate(
            { username: req.body.username },
            updateData,
            { new: true }
        );
        
        if (!updatedUser) {
            return res.status(404).send("User not found");
        }
        
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Server error");
    }
});

router.delete("/user/:id", verifyToken , async (req, res) => {
    try {
        const username = req.params.id;
        const result = await User.findOneAndDelete({ username: username });
       
        if (!result) {
            return res.status(404).send("User not found");
        }

        const users = await User.find({});
        res.send(users);
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send("Server error");
    }
});

module.exports = router;