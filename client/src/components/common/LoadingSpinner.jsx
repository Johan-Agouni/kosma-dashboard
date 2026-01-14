import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ fullPage }) => {
    if (fullPage) {
        return (
            <div className={styles.fullPage}>
                <div className={styles.spinner} />
            </div>
        );
    }
    return <div className={styles.spinner} />;
};

export default LoadingSpinner;
