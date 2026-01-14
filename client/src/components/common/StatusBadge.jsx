import styles from './StatusBadge.module.css';

const StatusBadge = ({ status, statusMap }) => {
    const config = statusMap[status] || { label: status, color: 'var(--color-text-muted)' };
    return (
        <span className={styles.badge} style={{ '--badge-color': config.color }}>
            {config.label}
        </span>
    );
};

export default StatusBadge;
