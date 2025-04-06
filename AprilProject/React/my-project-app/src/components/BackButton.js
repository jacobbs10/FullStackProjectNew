import { useNavigate } from 'react-router-dom';
import styles from './BackButton.module.css';

export function BackButton({ className, showConfirmation = false }) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (showConfirmation) {
            if (window.confirm('Are you sure you want to go back?')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    };

    return (
        <button 
            className={`${styles.backArrow} ${className}`}
            onClick={handleBack}
            title="Go back"
        >
            ← Back
        </button>
    );
} 