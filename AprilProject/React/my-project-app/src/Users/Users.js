import { useState, useEffect } from "react";
import tableStyle from "../CSS/myTable.module.css";
import UserModal from "./UserModal"; // We'll create this component
import FilterSortPopup from "../components/FilterSortPopup";


const Users = () => {
    // Move getMenuType before the useEffect that uses it
    const getMenuType = () => {
        const menuType = sessionStorage.getItem("menuType") || "";
        console.log(`menuType: ${menuType}`);
        return menuType;
    }

    // Updated useEffect for access control
    useEffect(() => {
        if (getMenuType() !== "admin") {
            // Go back to the previous page if not admin
            window.parent.history.back();
            return;
        }
    }, []);

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [pageSize, setPageSize] = useState(5);
    const [showFilterSort, setShowFilterSort] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [filters, setFilters] = useState({
        username: '',
        firstname: '',
        lastname: '',
        usertype: ''
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


    useEffect(() => {
        fetchData();
    }, []);

    // Apply filters whenever data or filters change
    useEffect(() => {
        if (data) {
            let filtered = [...data];
            
            // Apply all filters
            filtered = filtered.filter(item => {
                return (
                    item.username.toLowerCase().includes(filters.username.toLowerCase()) &&
                    item.firstname.toLowerCase().includes(filters.firstname.toLowerCase()) &&
                    item.lastname.toLowerCase().includes(filters.lastname.toLowerCase()) &&
                    item.usertype.toLowerCase().includes(filters.usertype.toLowerCase())
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
            console.log("Fetching data with token:", token);
            const response = await fetch(`http://localhost:8000/userAct/users?size=${pageSize}`, {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Received data:", result);

            // Assuming the response has { users: [...], pagination: {...} } structure
            if (result && result.users) {
                setData(result.users);
                setFilteredData(result.users);
                setPagination(result.pagination);
            } else {
                console.error("Invalid data format received:", result);
                setData([]);
                setFilteredData([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setData([]);
            setFilteredData([]);
        }
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

    const handlePageChange = async (newPage) => {
        try {
            const response = await fetch(`http://localhost:8000/userAct/users?size=${pageSize}&page=${newPage}`, {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result && result.users) {
                setData(result.users);
                setFilteredData(result.users);
                setPagination(result.pagination);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleUserClick = (userId) => {
        setSelectedUserId(userId);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleDelClick = async (id) => {
        console.log(`id: ${id}`);
        // Get the user's name for the confirmation message
        const userToDelete = data.find(item => item.username === id);
        const confirmDelete = window.confirm(`Are you sure you want to delete user ${userToDelete.username}?`);
        
        if (confirmDelete) {
            try {
                await fetch(`http://localhost:8000/userAct/user/${id}`, { method: 'DELETE' , 
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                setData((prevData) => prevData.filter((item) => item.product_id !== id));
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user. Please try again.");
            }
        }
    }

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
            username: '',
            firstname: '',
            lastname: '',
            usertype: ''
        });
    };

    const handleClearSort = () => {
        setSortConfig({ key: null, direction: 'ascending' });
    };

  return (
    <>
        <div className={tableStyle.container}>
            <div className={tableStyle.tableContainer}>
                <table>
                    <thead>
                        <tr>
                                <th scope="col" onClick={() => handleSort('firstname')} className={tableStyle.sortable}>
                                    First Name {sortConfig.key === 'firstname' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th scope="col" onClick={() => handleSort('lastname')} className={tableStyle.sortable}>
                                    Last Name {sortConfig.key === 'lastname' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                            <th scope="col">Email</th>
                                <th scope="col" onClick={() => handleSort('usertype')} className={tableStyle.sortable}>
                                    User Type {sortConfig.key === 'usertype' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                                <th scope="col" onClick={() => handleSort('username')} className={tableStyle.sortable}>
                                    Username {sortConfig.key === 'username' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                                </th>
                            {getMenuType() === "admin" && <th scope="col"></th>}
                        </tr>
                    </thead>
                    <tbody>
                            {Array.isArray(filteredData) && 
                                filteredData.map((item) => {
                            return <tr key={item.username}>                              
                                    <td><button onClick={() => handleUserClick(item.username)}>{item.firstname}</button></td>
                                    <td>{item.lastname}</td>
                                    <td>{item.email}</td>
                                    <td>{item.usertype}</td>
                                    <td>{item.username}</td>
                                    {getMenuType() === "admin" && (
                                        <td><button onClick={() => handleDelClick(item.username)}>Delete</button>
                                        <button onClick={() => window.location.href = `/userAct/user?username=${item.username}`}>Update</button>
                                        </td>
                                    )}
                                </tr>                                
                            })}
                    </tbody>                     
                </table>   
                <div className={tableStyle.buttonContainer}>
                        <button onClick={() => window.location.href = "/userAct/user?username="}>
                            Add User
                        </button>
                        <button onClick={() => setShowFilterSort(true)}>
                            Filter & Sort
                        </button>
                    </div>
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
                            Showing {((pagination.currentPage - 1) * pageSize) + 1} - {Math.min(pagination.currentPage * pageSize, pagination.total)} of {pagination.total} users
                        </p>
                </div>                                              
            </div>                        
        </div>
            
            {showModal && (
                    <UserModal 
                    userId={selectedUserId} 
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
                    isProductFilter ={false}
                />
            )}
    </>
  );
};

export default Users;