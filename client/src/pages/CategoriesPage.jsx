import { useState, useEffect } from 'react';
import {
    getCategoriesApi,
    createCategoryApi,
    updateCategoryApi,
    deleteCategoryApi,
} from '../api/categories.api';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import styles from '../styles/dashboard.module.css';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', description: '' });

    const fetchCategories = async () => {
        try {
            const { data } = await getCategoriesApi();
            setCategories(data.data);
        } catch {
            toast.error('Erreur');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const openCreate = () => {
        setForm({ name: '', description: '' });
        setEditId(null);
        setModalOpen(true);
    };

    const openEdit = cat => {
        setForm({ name: cat.name, description: cat.description || '' });
        setEditId(cat._id);
        setModalOpen(true);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (editId) {
                await updateCategoryApi(editId, form);
                toast.success('Categorie mise a jour');
            } else {
                await createCategoryApi(form);
                toast.success('Categorie creee');
            }
            setModalOpen(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Supprimer "${name}" ?`)) return;
        try {
            await deleteCategoryApi(id);
            toast.success('Categorie supprimee');
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    const inputStyle = {
        padding: '0.625rem 0.875rem',
        background: 'var(--color-bg-input)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-primary)',
        fontSize: 'var(--font-size-sm)',
        width: '100%',
        outline: 'none',
    };

    return (
        <div>
            <Header title="Categories" />
            <div className={styles.content}>
                <div className="page-header">
                    <span />
                    <Button onClick={openCreate}>+ Nouvelle categorie</Button>
                </div>

                <div className="card">
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Description</th>
                                <th>Produits</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat._id}>
                                    <td style={{ fontWeight: 500 }}>{cat.name}</td>
                                    <td style={{ color: 'var(--color-text-secondary)' }}>
                                        {cat.description || '-'}
                                    </td>
                                    <td>{cat.productCount}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => openEdit(cat)}
                                            >
                                                Modifier
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(cat._id, cat.name)}
                                            >
                                                Supprimer
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Modal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={editId ? 'Modifier la categorie' : 'Nouvelle categorie'}
                >
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-md)',
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: 4,
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Nom *
                            </label>
                            <input
                                style={inputStyle}
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: 4,
                                    fontSize: 'var(--font-size-sm)',
                                    color: 'var(--color-text-secondary)',
                                }}
                            >
                                Description
                            </label>
                            <textarea
                                style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <Button type="submit">{editId ? 'Mettre a jour' : 'Creer'}</Button>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default CategoriesPage;
