import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', size = 'md', loading, disabled, ...props }) => {
    return (
        <button
            className={`${styles.btn} ${styles[variant]} ${styles[size]}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className={styles.spinner} />}
            {children}
        </button>
    );
};

export default Button;
