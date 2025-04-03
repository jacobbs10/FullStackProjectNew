import { useState, useEffect } from "react";
import tableStyle from "../CSS/myTable.module.css";
import ProductModal from "./ProductModal"; // We'll create this component
import FilterSortPopup from "../components/FilterSortPopup";

const Products = () => {
    const [data, setData] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showFilterSort, setShowFilterSort] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [filters, setFilters] = useState({
        product_id: '',
        product_name: '',
        product_description: ''
    });
    const [pagination, setPagination] = useState({
        total: 0,
        pageSize: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
    });

    
    const token = sessionStorage.getItem("token");
    const pageSize = sessionStorage.getItem("pagesize"); // Get pagesize from session   
    console.log(`pageSize: ${pageSize}`);

    const getMenuType = () => {
        const menuType = sessionStorage.getItem("menuType") || "";

        console.log(`menuType: ${menuType}`);

        return menuType;
    }

    useEffect(() => {
        fetchData();
    }, [pageSize]); // Re-fetch when pageSize changes

     // Apply filters whenever data or filters change
     useEffect(() => {
        if (data) {
            let filtered = [...data];
            
            // Apply all filters
            filtered = filtered.filter(item => {
                return (
                    (filters.product_id === '' || 
                        item.product_id.toString().startsWith(filters.product_id.toString())) &&
                    item.product_name.toLowerCase().includes(filters.product_name.toLowerCase()) &&
                    item.product_description.toLowerCase().includes(filters.product_description.toLowerCase())
                );
            });

            // Apply sorting if configured
            if (sortConfig.key) {
                filtered.sort((a, b) => {
                    if (a[sortConfig.key] < b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (a[sortConfig.key] > b[sortConfig.key]) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                });
            }

            setFilteredData(filtered);
        }
    }, [data, filters, sortConfig]);

    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/products?size=${pageSize}`, {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();
            console.log("Fetched data:", result);

            if (result && result.products) {
                setData(result.products);
                setFilteredData(result.products);
                setPagination(result.pagination);
            } else {
                console.error("Invalid data format received:", result);
                setData([]);
                setFilteredData([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setData([]);
            setFilteredData([]);
        }
    };

    const handleProductClick = (productId) => {
        setSelectedProductId(productId);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleFilter = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDelClick = async (id) => {
        console.log(`id: ${id}`);
        // Get the user's name for the confirmation message
        const productToDelete = data.find(item => item.product_id === id);
        const confirmDelete = window.confirm(`Are you sure you want to delete product ${productToDelete.product_name}?`);
        
        if (confirmDelete) {
            try {
                await fetch(`http://localhost:8000/api/product/${id}`, { method: 'DELETE' , 
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setData((prevData) => prevData.filter((item) => item.product_id !== id));
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product. Please try again.");
            }
        }
    }

    const handlePageChange = async (newPage) => {
        try {
            const response = await fetch(`http://localhost:8000/api/products?size=${pageSize}&page=${newPage}`, {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();

            if (result && result.products) {    
                setData(result.products);
                setFilteredData(result.products);
                setPagination(result.pagination);
            } else {
                console.error("Invalid data format received:", result);
                setData([]);
                setFilteredData([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSortChange = (key, direction = 'ascending') => {
        setSortConfig({ key, direction });
    };

    const handleClearFilters = () => {
        setFilters({
            product_id: '',
            product_name: '',
            product_description: ''
        });
    };

    const handleClearSort = () => {
        setSortConfig({ key: null, direction: 'ascending' });
    };

    return (
        <>
            <div className={tableStyle.container}>
                {/* Left side - Table */}
                <div className={tableStyle.tableContainer}>
                    <table>
                        <thead>
                            <tr>
                                <th scope="col" onClick={() => handleSort('product_id')} className={tableStyle.sortable}>
                                    Product Id {sortConfig.key === 'product_id' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                                <th scope="col" onClick={() => handleSort('product_name')} className={tableStyle.sortable}>
                                    Product Name {sortConfig.key === 'product_name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}</th>
                                <th scope="col" onClick={() => handleSort('product_description')} className={tableStyle.sortable}>Product Description</th>
                                <th scope="col">Product Status</th>
                                {getMenuType() === "admin" && <th scope="col"></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr key={item.product_id}>                              
                                        <td><button onClick={() => handleProductClick(item.product_id)}>{item.product_id}</button></td>
                                        <td>{item.product_name}</td>
                                        <td>{item.product_description}</td>
                                        <td>{item.product_status ? "🟢 In Stock" : "🔴 Out of Stock"}</td>
                                        {getMenuType() === "admin" && (
                                            <td>
                                                <button onClick={() => handleDelClick(item.product_id)}>Delete</button>
                                                <button onClick={() => window.location.href = `/addproduct?id=${item.product_id}`}>Update</button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={getMenuType() === "admin" ? 5 : 4} style={{ textAlign: 'center' }}>
                                        No products found
                                    </td>
                                </tr>
                            )}
                        </tbody>                     
                    </table>

                    <div className={tableStyle.buttonContainer}>
                        <button onClick={() => window.location.href = "/addproduct?id="}>
                            Add product
                        </button>
                        <button onClick={() => setShowFilterSort(true)}>
                            Filter & Sort
                        </button>
                    </div>
                    

                    {/* Add pagination controls */}
                    <div className={tableStyle.paginationControls}>
                        <button 
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPreviousPage}
                            className={tableStyle.pageButton}
                        >
                            Previous
                        </button>
                        
                        <span className={tableStyle.pageInfo}>
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>

                        <button 
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                            className={tableStyle.pageButton}
                        >
                            Next
                        </button>
                    </div>

                    <div className={tableStyle.paginationInfo}>
                        <p>
                        Showing {((pagination.currentPage - 1) * pageSize) + 1} - {Math.min(pagination.currentPage * pageSize, pagination.total)} of {pagination.total} products
                        </p>
                    </div>
                </div>                        
            </div>

            {/* Modal Popup */}
            {showModal && (
                    <ProductModal 
                    productId={selectedProductId} 
                    onClose={closeModal} 
                    token={token}
                />
            )}
            {showFilterSort && (
                <FilterSortPopup
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    sortConfig={sortConfig}
                    onSortChange={handleSortChange}
                    onClose={() => setShowFilterSort(false)}
                    onClearFilters={handleClearFilters}
                    onClearSort={handleClearSort}
                    isProductFilter={true}
                />
            )}
        </>
    );
};

export default Products;