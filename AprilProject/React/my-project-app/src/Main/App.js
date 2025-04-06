//import logo from './logo.svg';
import { React, useState, useEffect, useCallback, useMemo } from "react";
import styles from '../CSS/MainStyles.module.css';
import { Outlet, Link, useNavigate } from "react-router-dom";
import api from '../utils/axios'; 
//import LoginPrompt from './pages/components/LoginPrompt';
import { processBulkRegistration } from '../utils/BulkUserRegistration';
import { processBulkProducts } from '../utils/BulkProducInsert';
//const { processBulkRegistration } = require('./utils/BulkUserRegistration');

const LoginExpiredPrompt = ({ onClose }) => {
  return (
    <div className={styles['login-prompt-overlay']}>
      <div className={styles['login-prompt-content']}>
        <h2>Session Expired</h2>
        <p>Your session has expired. Please log in again.</p>
        <button 
          onClick={onClose}
          className={styles.submitButton}
        >
          OK
        </button>
      </div>
    </div>
  );
};

function App() {
  const [iframeSrc, setIframeSrc] = useState(sessionStorage.getItem("iframesrc") || "");
  const [menuType, setMenuType] = useState(sessionStorage.getItem("menuType") || "");
  const [pageSize, setPageSize] = useState(Number(sessionStorage.getItem("pagesize")) || 12);
  const [loginValue, setLoginValue] = useState({username: "", password: ""});
  const [loggedIn, setLoggedIn] = useState({
    status: sessionStorage.getItem("loginStatus") === "true",
    Name: sessionStorage.getItem("userName") || ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(sessionStorage.getItem("token") || null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  sessionStorage.removeItem("iframesrc");
  //sessionStorage.removeItem("menuType");
  
// Check token validity on component mount and periodically
useEffect(() => {
  const checkTokenValidity = () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      // Only handle token expiration if there was a previous session
      if (sessionStorage.getItem("loginStatus") === "true") {
        handleTokenExpiration();
        setShowLoginPrompt(true);
      }
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      
      if (isExpired) {
        handleTokenExpiration();
        setShowLoginPrompt(true);
      } else {
        setIsTokenValid(true);
        setShowLoginPrompt(false);
      }
    } catch (error) {
      console.error("Token validation error:", error);
      setIsTokenValid(false);
      // Only show prompt if there was a previous session
      if (sessionStorage.getItem("loginStatus") === "true") {
        setShowLoginPrompt(true);
      }
    }
  };

  // Check immediately
  checkTokenValidity();

  // Check periodically (e.g., every minute)
  const interval = setInterval(checkTokenValidity, 300000);

  return () => clearInterval(interval);
}, []);

const handleTokenExpiration = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("menuType");
  sessionStorage.removeItem("pagesize");
  sessionStorage.removeItem("iframesrc");
  sessionStorage.removeItem("loginStatus");
  sessionStorage.removeItem("userName");
  
  setIsTokenValid(false);
  setLoggedIn({ status: false, Name: "" });
  setMenuType("");
  setPageSize(12);
  setShowLoginPrompt(true);
  setIframeSrc("");
};

// Add this new function to handle closing the prompt
const handleCloseLoginPrompt = () => {
  setShowLoginPrompt(false);
  // Focus on the username input field
  const usernameInput = document.querySelector('input[name="username"]');
  if (usernameInput) {
    usernameInput.focus();
  }
};

// Add axios interceptor for API calls
useEffect(() => {
  const interceptor = api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        sessionStorage.removeItem("token");
        setIsTokenValid(false);
        setLoggedIn({ status: false, Name: "" });
      }
      return Promise.reject(error);
    }
  );

  return () => api.interceptors.response.eject(interceptor);
}, []);

  useEffect(() => {
    // Update iframe source when the component mounts
    const storedSrc = sessionStorage.getItem("iframesrc");
    if (storedSrc) {
        setIframeSrc(storedSrc);
    }

    // Event listener for storage changes
    const handleStorageChange = (event) => {
        if (event.key === "iframesrc") {
            setIframeSrc(event.newValue); // Update the state with new value
        }
    };

    // Add event listener
    window.addEventListener("storage", handleStorageChange);

    // Cleanup event listener on unmount
    return () => {
        window.removeEventListener("storage", handleStorageChange);
    };
}, []);
  
  const handleInputChange = useCallback((event) => {
    const { name, value } = event.target; // Extract name & value from input
    //console.log(`name: ${name} value: ${value}`)
    setLoginValue((prev) => ({
        ...prev,  // Keep the other state values unchanged
        [name]: value  // Dynamically update either userName or password
    }));
  }, []);

  const handleFileSelect = async (event, mode) => {
    const file = event.target.files[0];
    // Store the input element to reset it later
    const fileInput = event.target;
    let result;
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const content = e.target.result;
            if (mode === "users") { 
              result = await processBulkRegistration(content);
            } else if (mode === "products") {
              result = await processBulkProducts(content);
            }
            
            if (result.success) {
              alert(`Successfully registered ${result.data.success.count} users`);
              if (result.data.failures.count > 0) {
                alert(`Failed to register ${result.data.failures.count} users`);
                console.log('Failed registrations:', result.data.failures);
              }
            } else {
              if (result.errors) {
                alert('Validation errors found. Check console for details.');
                console.log('Validation errors:', result.errors);
              } else {
                alert(`Error: ${result.error}`);
              }
            }
          } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file');
          }
        };
        reader.readAsText(file);
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file');
      } finally {
        // Reset the file input after processing
        fileInput.value = '';
    }
    }
  };

  const getUrlForUpdate = (url) => {
    if (url === "updateProduct") {  
      const productId = prompt("Please enter the product ID of the Product you wish to update:");
      if (productId) {
        return `/addproduct?id=${productId}`;
      }
      return "/products"; // Default fallback if no ID is provided
    }
    else if (url === "updateUser") {
      const userId = prompt("Please enter the username of the User you wish to update:");
      if (userId) { 
        return `/userAct/user?username=${userId}`;
      }
      return "/users"; // Default fallback if no ID is provided
    }
  };


  const fetchProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/product/${productId}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch product data");
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  };

  // Separate delete product function
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      return true;
    } catch (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  };

  const handleDeleteProduct = async () => {
    const productId = prompt("Please enter the product ID of the Product you wish to delete:");
    if (!productId) return;

    try {
      setLoading(true);
      const productData = await fetchProduct(productId);
      
      const confirmDelete = window.confirm(
        `Are you sure you want to delete product:\nID: ${productData.product_id}\nName: ${productData.product_name}?`
      );

      if (confirmDelete) {
        await deleteProduct(productId);
        alert("Product deleted successfully");
        handleMenuClick("/products"); // Refresh products view
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/userAct/user/${userId}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  };

  const deleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8000/userAct/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  };

  const handleDeleteUser = async () => {
    const userId = prompt("Please enter the username of the User you wish to delete:");
    if (!userId) return;

    try {
      setLoading(true);
      const userData = await fetchUser(userId);
      
      const confirmDelete = window.confirm(
        `Are you sure you want to delete user:\nID: ${userData.user_id}\nName: ${userData.username}?`
      );

      if (confirmDelete) {
        await deleteUser(userId);
        alert("User deleted successfully");
        handleMenuClick("/users"); // Refresh users view
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };




  const handleMenuClick = (url) => {
    let newUrl = ( url === "updateProduct" || url === "updateUser" ) ? getUrlForUpdate(url) : url;
    
    setIframeSrc(newUrl); // Update the iframe source when a link is clicked 
    sessionStorage.setItem("iframesrc", newUrl);
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("menuType");
    sessionStorage.removeItem("pagesize");
    sessionStorage.removeItem("iframesrc");
    sessionStorage.removeItem("loginStatus");
    sessionStorage.removeItem("userName");

    // Reset state
    setLoggedIn({ status: false, Name: "" });
    setMenuType("");
    setPageSize(12);
    setIsTokenValid(false);
    setIframeSrc("");
  };

  const getHeader = () => {
    if (loggedIn.status) {
      return (
        <div className={styles.headerContent}>
            <h1>Welcome {loggedIn.Name}</h1>
            <button 
                onClick={handleLogout}
                className={styles.logoutButton}
            >
                Logout
            </button>
        </div>
      );
    } else {
        return (
            <>
                <h3>Please Log In</h3>
                <form onSubmit={handleSubmit}>
                <input 
                    type="text"
                    name="username"  // Match state key
                    value={loginValue.username} 
                    onChange={handleInputChange}
                    placeholder="Enter Username"
                    className={styles.inputBox} 
                />
                <input
                    type="password"
                    name="password"  // Match state key
                    value={loginValue.password}
                    onChange={handleInputChange}
                    placeholder="Enter Password"
                    className={styles.inputBox} 
                />
                {error && <div className={styles.error}>{error}</div>}
                <button type="submit" className={styles.submitButton}>Submit</button>
            </form>
            </>
        );
    }
};

const handleSubmit = async (event) => {
  event.preventDefault();
  setError("");
  
  try {
      const response = await fetch('http://localhost:8000/auth/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(loginValue)
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store login information in sessionStorage
      sessionStorage.setItem("loginStatus", "true");
      sessionStorage.setItem("userName", data.username);
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("menuType", data.userType);
      sessionStorage.setItem("pagesize", data.pagesize);

      setLoggedIn({
          status: true, 
          Name: data.name
      });

      setToken(data.token);
      setMenuType(data.userType);
      setPageSize(data.pagesize);
      setShowLoginPrompt(false);
      setIsTokenValid(true);
      
      navigate('/');
  } catch (error) {
      console.error("Error:", error);
      setError("Login failed. Please check your credentials.");
  }
};

  const getMenu = () => {
    switch (menuType) {
      case "admin":
        return (
          <>
            <li>Adming Activities           
              <ul className={styles.nestedList}>                
                <li><Link onClick={() => handleMenuClick("/users") }>Show users</Link></li>
                <li><Link onClick={() => handleMenuClick("/userAct/user") }>Add user</Link></li>
                <li><Link onClick={() => handleMenuClick("updateUser") }>Update User</Link></li>                
                <li><Link onClick={() => handleDeleteUser() }>Delete User</Link></li>                               
                <li>
                  <label className={styles.fileUploadLabel}>
                    Bulk Upload Users
                    <input
                      type="file"
                      accept=".json, .txt"
                      onChange={(event) => handleFileSelect(event, "users")}
                      style={{ display: 'none' }}
                    />
                  </label>
                </li>
              </ul>
            </li>
            <li>Product Handling          
              <ul className={styles.nestedList}> 
                <li><Link onClick={() => handleMenuClick("/products") }>View Products</Link></li>
                <li><Link onClick={() => handleMenuClick("/addproduct") }>Add Product</Link></li>
                <li><Link onClick={() => handleMenuClick("updateProduct") }>Update Product</Link></li>                
                <li><Link onClick={() => handleDeleteProduct() }>Delete Product</Link></li>
                <li>
                  <label className={styles.fileUploadLabel}>
                    Bulk Upload Products
                    <input
                      type="file"
                      accept=".json, .txt"
                      onChange={(event) => handleFileSelect(event, "products")}
                      style={{ display: 'none' }}
                    />
                  </label>
                </li>
              </ul>
            </li>
            <li><Link onClick={() => handleMenuClick("/profile") }>My Profile</Link></li>
          </>
        );
      case "implementer":
        return (
          <>
            <li><Link onClick={() => handleMenuClick("/products") }>View Products</Link></li>
            <li><Link onClick={() => handleMenuClick("/addproduct") }>Add Product</Link></li>
            <li><Link onClick={() => handleMenuClick("updateProduct") }>Update Product</Link></li>            
            <li><Link onClick={() => handleDeleteProduct() }>Delete Product</Link></li>            
            <li>
              <label className={styles.fileUploadLabel}>
                Bulk Upload Products
                <input
                  type="file"
                  accept=".json, .txt"
                  onChange={(event) => handleFileSelect(event, "products")}
                  style={{ display: 'none' }}
                />
              </label>
            </li>
            <li><Link onClick={() => handleMenuClick("/profile") }>My Profile</Link></li>
          </>
        );
        case "user":
        return (
          <>
            <li><Link onClick={() => handleMenuClick("/products") }>View Products</Link></li>
            <li><Link onClick={() => handleMenuClick("/profile") }>My Profile</Link></li>  
          </>
        );
      default:
        return <li><Link to="/">Home</Link></li>;
    }
  };

  async function registerUsersFromFile(filePath) {
    try {
        const result = await processBulkRegistration(filePath);
        
        if (result.success) {
            console.log('Registration successful:', result.data);
            console.log(`Successfully registered ${result.data.success.count} users`);
            if (result.data.failures.count > 0) {
                console.log('Failed registrations:', result.data.failures);
            }
        } else {
            if (result.errors) {
                console.log('Validation errors:', result.errors);
            } else {
                console.log('Error:', result.error);
            }
        }
    } catch (error) {
        console.error('Error processing file:', error);
    }
}

  //const MemoizedLoginPrompt = useMemo(() => <LoginPrompt />, []);

  return (
    <div className={styles.container}>
      {showLoginPrompt && <LoginExpiredPrompt onClose={handleCloseLoginPrompt} />}
      <div className={styles.menu}>
        <h2>Menu</h2>
        <nav>
          <ul>{getMenu()}</ul>
        </nav>              
      </div>
      <div className={styles.content}>
        <div className={styles.header}>{getHeader()}</div>
        <div className={styles.middle}>
          {iframeSrc && (
            <iframe
              src={iframeSrc} 
              width="100%"
              height="100%"
              style={{ border: "none" }}                                  
            ></iframe>                
          )}
        </div>
        <div className={styles.footer}></div>
      </div>
      <style>{styles.modalStyles}</style>
    </div>
  );
}

export default App;
