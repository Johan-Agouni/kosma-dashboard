import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            padding: '2rem',
            background: 'var(--color-bg-primary)',
        }}>
            {/* Illustration SVG — boite ouverte vide */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ opacity: 0.8 }}>
                <rect x="20" y="45" width="80" height="55" rx="4" stroke="var(--color-accent)" strokeWidth="2.5" fill="none" />
                <path d="M20 55h80" stroke="var(--color-border)" strokeWidth="1.5" strokeDasharray="4 3" />
                <path d="M30 45V30l30-12 30 12v15" stroke="var(--color-accent)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
                <path d="M60 18v27" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
                <circle cx="47" cy="72" r="3" fill="var(--color-text-muted)" />
                <circle cx="73" cy="72" r="3" fill="var(--color-text-muted)" />
                <path d="M50 85c2 -4 18 -4 20 0" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>

            <div style={{ textAlign: 'center' }}>
                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '4rem',
                    fontWeight: 700,
                    color: 'var(--color-accent)',
                    lineHeight: 1,
                    marginBottom: '0.5rem',
                }}>
                    404
                </h1>
                <p style={{
                    fontSize: 'var(--font-size-lg)',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '0.25rem',
                }}>
                    Cette page n'existe pas
                </p>
                <p style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-muted)',
                }}>
                    Elle a peut-etre ete deplacee, ou l'URL est incorrecte.
                </p>
            </div>

            <Link to="/">
                <Button>Retour au dashboard</Button>
            </Link>
        </div>
    );
};

export default NotFoundPage;
