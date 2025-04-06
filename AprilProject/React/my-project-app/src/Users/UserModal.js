import { useState, useEffect } from "react";
import "../CSS/ModalStyles.css"; // We'll create this CSS file

const UserModal = ({ userId, onClose, token }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8000/userAct/user/${userId}`, {
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error("Failed to fetch user data");
                }
                
                const userData = await response.json();
                setData(userData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, token]);

    // Handle clicking outside to close
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const RenderObject = ({ obj, level = 0 }) => {
        return (
            <div className={`nested-level-${level}`}>
                {Object.entries(obj).map(([key, value]) => (
                    <div key={key} className="field">
                        {typeof value === "object" && value !== null ? (
                            <>
                                <span className="key">{key}:</span>
                                <RenderObject obj={value} level={level + 1} />
                            </>
                        ) : (
                            <p>
                                <span className="key">{key}:</span>{" "}
                                <span className="value">{value?.toString()}</span>
                            </p>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal-content">
                <div className="modal-header">
                    <h2>User Details</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {loading && <p>Loading...</p>}
                    {error && <p className="error">Error: {error}</p>}
                    {data && <RenderObject obj={data} />}
                </div>
            </div>
        </div>
    );
};

export default UserModal;