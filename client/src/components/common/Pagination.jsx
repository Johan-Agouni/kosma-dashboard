import styles from './Pagination.module.css';

const Pagination = ({ pagination, onPageChange }) => {
    if (!pagination || pagination.pages <= 1) return null;

    const { page, pages, total } = pagination;

    const getPageNumbers = () => {
        const items = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(pages, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) items.push(i);
        return items;
    };

    return (
        <div className={styles.wrapper}>
            <span className={styles.info}>{total} resultats</span>
            <div className={styles.pages}>
                <button
                    className={styles.pageBtn}
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    &laquo;
                </button>
                {getPageNumbers().map(num => (
                    <button
                        key={num}
                        className={`${styles.pageBtn} ${num === page ? styles.active : ''}`}
                        onClick={() => onPageChange(num)}
                    >
                        {num}
                    </button>
                ))}
                <button
                    className={styles.pageBtn}
                    disabled={page >= pages}
                    onClick={() => onPageChange(page + 1)}
                >
                    &raquo;
                </button>
            </div>
        </div>
    );
};

export default Pagination;
