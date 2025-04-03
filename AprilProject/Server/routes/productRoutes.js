const express = require('express');
const router = express.Router();
const Product = require('../models/ProductModel');
const verifyToken = require('../middleware/authMiddleware');

// Get all products with pagination
router.get("/products", verifyToken, async (req, res) => {
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
        const totalCount = await Product.countDocuments({});

        // Get products with pagination
        const products = await Product.find({})
            .skip(skip)
            .limit(size);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / size);

        // Send response with pagination info
        res.json({
            products: products,
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
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Server error" });
    } 
});

// Get product by ID
router.get("/product/:id", verifyToken, async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const product = await Product.findOne({ product_id: productId });
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Server error" });
    }   
});

// Create product
router.post("/product", verifyToken, async (req, res) => {
    const { product_id, product_name, product_description, product_status, current_stock_level } = req.body;

    if (!product_id) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    try {
        const existingProduct = await Product.findOne({ product_id: product_id });
        if (existingProduct) {
            return res.status(409).json({ message: "Product already exists" });
        }

        const newProduct = new Product({
            product_id: product_id, 
            product_name: product_name, 
            product_description: product_description, 
            product_update_date: new Date(), 
            product_status: product_status, 
            current_stock_level: current_stock_level
        });
        await newProduct.save();
        
        const products = await Product.find({});        
        res.json(products);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Server error" });
    } 
});

// Bulk insert products
router.post("/products/bulk", verifyToken, async (req, res) => {
    try {
        const products = req.body;
        
        if (!Array.isArray(products)) {
            return res.status(400).json({ 
                error: 'Request body must be an array of products' 
            });
        }

        const insertedProducts = [];
        const errors = [];

        // Process each product in the array
        for (const productData of products) {
            try {
                const { 
                    product_id, 
                    product_name, 
                    product_description, 
                    product_status, 
                    current_stock_level 
                } = productData;

                // Check if product already exists
                const existingProduct = await Product.findOne({ product_id: product_id });
                if (existingProduct) {
                    errors.push({
                        product_id,
                        error: 'Product ID already exists'
                    });
                    continue;
                }

                // Create new product
                const newProduct = new Product({
                    product_id,
                    product_name,
                    product_description,
                    product_update_date: new Date(),
                    product_status,
                    current_stock_level
                });

                await newProduct.save();
                insertedProducts.push(product_id);

            } catch (error) {
                errors.push({
                    product_id: productData.product_id,
                    error: error.message
                });
            }
        }

        // Get all products after bulk insert
        const allProducts = await Product.find({});

        // Return detailed response
        res.status(201).json({
            success: {
                count: insertedProducts.length,
                products: insertedProducts
            },
            failures: {
                count: errors.length,
                errors: errors
            },
            allProducts: allProducts // Return updated product list
        });

    } catch (error) {
        console.error("Error in bulk product insert:", error);
        res.status(500).json({ 
            error: 'Bulk insert failed', 
            details: error.message 
        });
    }
});

// Update product
router.put("/product", verifyToken, async (req, res) => {
    const { product_id, product_name, product_description, product_status, current_stock_level } = req.body;
    if (!product_id) {
        return res.status(400).json({ message: "Product ID is required" });
    }

    try {        
        const updateData = {
            $set: {
                product_id: product_id,
                product_name: product_name,
                product_description: product_description,                
                product_status: product_status,
                current_stock_level: current_stock_level                
            },
            $currentDate: { product_update_date: true }
        };

        const updatedProduct = await Product.findOneAndUpdate(
            { product_id: product_id },
            updateData,
            { new: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Delete product
router.delete("/product/:id", verifyToken, async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const result = await Product.findOneAndDelete({ product_id: productId });
       
        if (!result) {
            return res.status(404).json({ message: "Product not found" });
        }

        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;