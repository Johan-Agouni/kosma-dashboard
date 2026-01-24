/**
 * Composant Skeleton — placeholders animes pendant le chargement.
 *
 * Remplace les spinners generiques par des formes qui imitent
 * le contenu reel (cards, lignes de tableau, graphiques).
 * Ca donne une impression de vitesse et de polish.
 */
import styles from './Skeleton.module.css';

const Block = ({ width, height, circle, style }) => (
    <div
        className={`${styles.skeleton} ${circle ? styles.circle : ''}`}
        style={{ width, height, ...style }}
    />
);

/** Skeleton pour la page Dashboard */
export const DashboardSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        {/* 4 stats cards */}
        <div className={styles.statsGrid}>
            {[0, 1, 2, 3].map(i => (
                <div key={i} className={styles.statsCard}>
                    <Block width="40px" height="40px" circle />
                    <Block width="60%" height="0.75rem" />
                    <Block width="40%" height="1.75rem" />
                </div>
            ))}
        </div>

        {/* 2 graphiques */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            {[0, 1].map(i => (
                <div key={i} className={styles.chartCard}>
                    <Block width="40%" height="1.25rem" style={{ marginBottom: '1rem' }} />
                    <Block width="100%" height="220px" />
                </div>
            ))}
        </div>

        {/* Tableau */}
        <div className={styles.chartCard}>
            <Block width="30%" height="1.25rem" style={{ marginBottom: '1rem' }} />
            {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className={styles.tableRow}>
                    <Block height="0.875rem" />
                    <Block height="0.875rem" />
                    <Block height="0.875rem" width="60%" />
                    <Block height="1.25rem" width="70px" style={{ borderRadius: 'var(--radius-sm)' }} />
                    <Block height="0.875rem" width="50%" />
                </div>
            ))}
        </div>
    </div>
);

/** Skeleton pour les pages avec tableau (Produits, Commandes, Clients) */
export const TableSkeleton = ({ columns = 6, rows = 8 }) => (
    <div className={styles.chartCard}>
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={styles.tableRow} style={{
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
            }}>
                {Array.from({ length: columns }).map((_, j) => (
                    <Block key={j} height="0.875rem" width={j === 0 ? '80%' : '60%'} />
                ))}
            </div>
        ))}
    </div>
);

export default Block;
