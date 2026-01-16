import styles from './StatsCard.module.css';

const StatsCard = ({ title, value, icon, color = 'var(--color-accent)' }) => {
    return (
        <div className={styles.card}>
            <div className={styles.iconWrap} style={{ '--card-color': color }}>
                {icon}
            </div>
            <div>
                <p className={styles.title}>{title}</p>
                <p className={styles.value}>{value}</p>
            </div>
        </div>
    );
};

export default StatsCard;
