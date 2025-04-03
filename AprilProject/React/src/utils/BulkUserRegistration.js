// Required attributes for validation
const REQUIRED_ATTRIBUTES = [
    'firstname',
    'lastname',
    'email',
    'usertype',
    'username',
    'password',
    'birthdate'
];

// Optional attributes that are allowed
const OPTIONAL_ATTRIBUTES = [
    'preferences'
];

// All valid attributes combined
const ALL_VALID_ATTRIBUTES = [...REQUIRED_ATTRIBUTES, ...OPTIONAL_ATTRIBUTES];

// Validate a single user object
const validateUserObject = (user) => {
    const errors = [];
    
    // Check all required attributes exist and are correctly named
    REQUIRED_ATTRIBUTES.forEach(attr => {
        if (!user.hasOwnProperty(attr)) {
            errors.push(`Missing or incorrectly named attribute: ${attr}`);
        }
    });

    // Check for invalid attributes
    Object.keys(user).forEach(key => {
        if (!ALL_VALID_ATTRIBUTES.includes(key)) {
            errors.push(`Unknown attribute: ${key}`);
        }
    });

    // Validate birthdate format (now required)
    if (!user.birthdate) {
        errors.push('birthdate is required');
    } else {
        const date = new Date(user.birthdate);
        if (isNaN(date.getTime())) {
            errors.push('Invalid birthdate format. Use YYYY-MM-DD');
        }
    }

    // Validate preferences if present
    if (user.preferences) {
        if (typeof user.preferences !== 'object') {
            errors.push('preferences must be an object');
        } else {
            // Check if pagesize exists and is a number
            if ('pagesize' in user.preferences) {
                if (!Number.isInteger(user.preferences.pagesize)) {
                    errors.push('preferences.pagesize must be an integer');
                }
            }
            // Check for unknown preferences attributes
            Object.keys(user.preferences).forEach(key => {
                if (key !== 'pagesize') {
                    errors.push(`Unknown preferences attribute: ${key}`);
                }
            });
        }
    }

    return errors;
};

// Main function to process bulk registration
export const processBulkRegistration = async (fileContent) => {
    try {
        let users;
        
        try {
            users = JSON.parse(fileContent);
        } catch (error) {
            throw new Error('Invalid JSON format in file');
        }

        // Validate it's an array
        if (!Array.isArray(users)) {
            throw new Error('File content must be an array of users');
        }

        // Validate each user object
        const validationErrors = [];
        users.forEach((user, index) => {
            const userErrors = validateUserObject(user);
            if (userErrors.length > 0) {
                validationErrors.push({
                    index,
                    user,
                    errors: userErrors
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
        console.log("Token in bulkRegistration:", token); // Debug log
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Send to server
        const response = await fetch('http://localhost:8000/auth/bulkRegister', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `${token}`
            },
            body: JSON.stringify(users)
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
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