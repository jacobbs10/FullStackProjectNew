import React from 'react';
import styles from '../CSS/myTable.module.css';

const FilterSortPopup = ({ 
    filters, 
    onFilterChange, 
    sortConfig, 
    onSortChange, 
    onClose,
    onClearFilters,
    onClearSort,
    isProductFilter 
}) => {
    // Define placeholders based on filter type
    const placeholders = isProductFilter ? {
        // Product filter placeholders
        product_id: "Enter Product ID",
        product_name: "Enter Product Name",
        product_description: "Enter Product Description",
        product_status: "Select Status"
    } : {
        // User filter placeholders
        username: "Enter Username",
        firstname: "Enter First Name",
        lastname: "Enter Last Name",
        usertype: "Enter User Type"
    };

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
            {isProductFilter ? (
                <h2>Filter and Sort Products</h2>
            ) : (<h2>Filter and Sort Users</h2>

            )}
                
                <div className={styles.filterSection}>
                    <h3>Filters</h3>
                    {isProductFilter ? (
                        // Product filters
                        <>
                            <input
                                type="number"
                                name="product_id"
                                value={filters.product_id}
                                onChange={onFilterChange}
                                placeholder={placeholders.product_id}
                                min="1"
                                className={styles.filterInput}
                            />
                            <input
                                type="text"
                                name="product_name"
                                value={filters.product_name}
                                onChange={onFilterChange}
                                placeholder={placeholders.product_name}
                                className={styles.filterInput}
                            />
                            <input
                                type="text"
                                name="product_description"
                                value={filters.product_description}
                                onChange={onFilterChange}
                                placeholder={placeholders.product_description}
                                className={styles.filterInput}
                            />
                            <select
                                name="product_status"
                                value={filters.product_status}
                                onChange={onFilterChange}
                                className={styles.filterInput}
                            >
                                <option value="">{placeholders.product_status}</option>
                                <option value="true">In Stock</option>
                                <option value="false">Out of Stock</option>
                            </select>
                        </>
                    ) : (
                        // User filters
                        <>
                            <input
                                type="text"
                                name="username"
                                placeholder={placeholders.username}
                                value={filters.username}
                                onChange={onFilterChange}
                                className={styles.filterInput}
                            />
                            <input
                                type="text"
                                name="firstname"
                                placeholder={placeholders.firstname}
                                value={filters.firstname}
                                onChange={onFilterChange}
                                className={styles.filterInput}
                            />
                            <input
                                type="text"
                                name="lastname"
                                placeholder={placeholders.lastname}
                                value={filters.lastname}
                                onChange={onFilterChange}
                                className={styles.filterInput}
                            />
                            <input
                                type="text"
                                name="usertype"
                                placeholder={placeholders.usertype}
                                value={filters.usertype}
                                onChange={onFilterChange}
                                className={styles.filterInput}
                            />
                        </>
                    )}
                    <button onClick={onClearFilters} className={styles.clearButton}>
                        Clear Filters
                    </button>
                </div>

                <div className={styles.sortSection}>
                    <h3>Sort By</h3>
                    <div className={styles.sortInputs}>
                    {isProductFilter ? (
                        <select
                        value={sortConfig.key || ''}
                        onChange={(e) => onSortChange(e.target.value)}
                        className={styles.sortSelect}
                    >
                        <option value="">None</option>
                        <option value="product_id">Product ID</option>
                        <option value="product_name">Product Name</option>
                        <option value="product_description">Product Description</option>
                        <option value="product_status">Product Status</option>
                    </select>

                    ) : (
                        <select
                            value={sortConfig.key || ''}
                            onChange={(e) => onSortChange(e.target.value)}
                            className={styles.sortSelect}
                        >
                            <option value="">None</option>
                            <option value="username">Username</option>
                            <option value="firstname">First Name</option>
                            <option value="lastname">Last Name</option>
                            <option value="usertype">User Type</option>
                        </select>
                    )}
                        {sortConfig.key && (
                            <select
                                value={sortConfig.direction}
                                onChange={(e) => onSortChange(sortConfig.key, e.target.value)}
                                className={styles.sortSelect}
                            >
                                <option value="ascending">Ascending</option>
                                <option value="descending">Descending</option>
                            </select>
                        )}
                    </div>
                    <button onClick={onClearSort} className={styles.clearButton}>
                        Clear Sort
                    </button>
                </div>

                <div className={styles.popupButtons}>
                    <button onClick={onClose} className={styles.closeButton}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterSortPopup; 