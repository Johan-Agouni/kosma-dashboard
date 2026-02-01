import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductApi, createProductApi, updateProductApi } from '../api/products.api';
import { getCategoriesApi } from '../api/categories.api';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
};
const labelStyle = {
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
};
const inputStyle = {
    padding: '0.625rem 0.875rem',
    background: 'var(--color-bg-input)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text-primary)',
    fontSize: 'var(--font-size-sm)',
    outline: 'none',
};

const ProductEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        sku: '',
        category: '',
        status: 'draft',
        tags: '',
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getCategoriesApi()
            .then(res => setCategories(res.data.data))
            .catch(() => {});
        if (isEdit) {
            getProductApi(id)
                .then(res => {
                    const p = res.data.data;
                    setForm({
                        name: p.name,
                        description: p.description || '',
                        price: p.price,
                        stock: p.stock,
                        sku: p.sku || '',
                        category: p.category?._id || '',
                        status: p.status,
                        tags: p.tags?.join(', ') || '',
                    });
                })
                .catch(() => toast.error('Produit introuvable'))
                .finally(() => setLoading(false));
        }
    }, [id, isEdit]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                price: parseFloat(form.price),
                stock: parseInt(form.stock, 10),
                tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
            };
            if (isEdit) {
                await updateProductApi(id, payload);
                toast.success('Produit mis a jour');
            } else {
                await createProductApi(payload);
                toast.success('Produit cree');
            }
            navigate('/products');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner fullPage />;

    return (
        <div>
            <Header title={isEdit ? 'Modifier le produit' : 'Nouveau produit'} />
            <div className="card" style={{ maxWidth: 640, marginTop: 'var(--spacing-xl)' }}>
                <form
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}
                >
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Nom *</label>
                        <input
                            style={inputStyle}
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            maxLength={200}
                        />
                    </div>
                    <div style={fieldStyle}>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            maxLength={2000}
                        />
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 'var(--spacing-md)',
                        }}
                    >
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Prix (EUR) *</label>
                            <input
                                style={inputStyle}
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.price}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Stock *</label>
                            <input
                                style={inputStyle}
                                name="stock"
                                type="number"
                                min="0"
                                value={form.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 'var(--spacing-md)',
                        }}
                    >
                        <div style={fieldStyle}>
                            <label style={labelStyle}>SKU</label>
                            <input
                                style={inputStyle}
                                name="sku"
                                value={form.sku}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Categorie *</label>
                            <select
                                style={inputStyle}
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Choisir...</option>
                                {categories.map(c => (
                                    <option key={c._id} value={c._id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 'var(--spacing-md)',
                        }}
                    >
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Statut</label>
                            <select
                                style={inputStyle}
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="draft">Brouillon</option>
                                <option value="active">Actif</option>
                                <option value="archived">Archive</option>
                            </select>
                        </div>
                        <div style={fieldStyle}>
                            <label style={labelStyle}>Tags (separes par des virgules)</label>
                            <input
                                style={inputStyle}
                                name="tags"
                                value={form.tags}
                                onChange={handleChange}
                                placeholder="tech, promo"
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'var(--spacing-md)' }}>
                        <Button type="submit" loading={saving}>
                            {isEdit ? 'Mettre a jour' : 'Creer le produit'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/products')}
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditPage;
