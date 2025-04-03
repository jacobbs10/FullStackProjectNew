// Required attributes for product validation
const REQUIRED_ATTRIBUTES = [
    'product_id',
    'product_name',
    'product_description',
    'product_status',
    'current_stock_level'
];

// Validate a single product object
const validateProductObject = (product) => {
    const errors = [];
    
    // Check all required attributes exist and are correctly named
    REQUIRED_ATTRIBUTES.forEach(attr => {
        if (!product.hasOwnProperty(attr)) {
            errors.push(`Missing or incorrectly named attribute: ${attr}`);
        }
    });

    // Check for extra attributes
    Object.keys(product).forEach(key => {
        if (!REQUIRED_ATTRIBUTES.includes(key)) {
            errors.push(`Unknown attribute: ${key}`);
        }
    });

    // Validate data types
    if (typeof product.product_id !== 'number') {
        errors.push('product_id must be a number');
    }
    if (typeof product.product_name !== 'string') {
        errors.push('product_name must be a string');
    }
    if (typeof product.product_description !== 'string') {
        errors.push('product_description must be a string');
    }
    if (typeof product.product_status !== 'boolean') {
        errors.push('product_status must be a boolean');
    }
    if (typeof product.current_stock_level !== 'number') {
        errors.push('current_stock_level must be a number');
    }

    return errors;
};

// Main function to process bulk product insertion
export const processBulkProducts = async (fileContent) => {
    try {
        let products;
        
        try {
            products = JSON.parse(fileContent);
        } catch (error) {
            throw new Error('Invalid JSON format in file');
        }

        // Validate it's an array
        if (!Array.isArray(products)) {
            throw new Error('File content must be an array of products');
        }

        // Validate each product object
        const validationErrors = [];
        products.forEach((product, index) => {
            const productErrors = validateProductObject(product);
            if (productErrors.length > 0) {
                validationErrors.push({
                    index,
                    product,
                    errors: productErrors
                });
            }
        });

        // If there are validation errors, return them
        if (validationErrors.length > 0) {
            return {
                success: false,
                errors: validationErrors
            };
        }

        // Get token from session storage
        const token = sessionStorage.getItem("token");
        console.log("Token in bulkProducts:", token); // Debug log
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Send to server
        const response = await fetch('http://localhost:8000/api/products/bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify(products)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with status: ${response.status}. ${errorText}`);
        }

        const result = await response.json();
        return {
            success: true,
            data: result
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};