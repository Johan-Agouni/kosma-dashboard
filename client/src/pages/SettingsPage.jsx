import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateMeApi, changePasswordApi } from '../api/auth.api';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { ROLES } from '../utils/constants';

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

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const handleProfileSubmit = async e => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            const { data } = await updateMeApi(profile);
            updateUser(data.data);
            toast.success('Profil mis a jour');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async e => {
        e.preventDefault();
        setSavingPassword(true);
        try {
            await changePasswordApi(passwords);
            toast.success('Mot de passe modifie');
            setPasswords({ currentPassword: '', newPassword: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erreur');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div>
            <Header title="Parametres" />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--spacing-xl)',
                    maxWidth: 560,
                    marginTop: 'var(--spacing-xl)',
                }}
            >
                <div className="card">
                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Profil</h3>
                    <p
                        style={{
                            fontSize: 'var(--font-size-sm)',
                            color: 'var(--color-text-secondary)',
                            marginBottom: 'var(--spacing-md)',
                        }}
                    >
                        Role : {ROLES[user?.role]}
                    </p>
                    <form
                        onSubmit={handleProfileSubmit}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-md)',
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 'var(--spacing-md)',
                            }}
                        >
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: 4,
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                >
                                    Prenom
                                </label>
                                <input
                                    style={inputStyle}
                                    value={profile.firstName}
                                    onChange={e =>
                                        setProfile({ ...profile, firstName: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: 4,
                                        fontSize: 'var(--font-size-sm)',
                                    }}
                                >
                                    Nom
                                </label>
                                <input
                                    style={inputStyle}
                                    value={profile.lastName}
                                    onChange={e =>
                                        setProfile({ ...profile, lastName: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: 4,
                                    fontSize: 'var(--font-size-sm)',
                                }}
                            >
                                Email
                            </label>
                            <input
                                style={inputStyle}
                                type="email"
                                value={profile.email}
                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                            />
                        </div>
                        <Button type="submit" loading={savingProfile}>
                            Sauvegarder
                        </Button>
                    </form>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Changer le mot de passe</h3>
                    <form
                        onSubmit={handlePasswordSubmit}
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
                                }}
                            >
                                Mot de passe actuel
                            </label>
                            <input
                                style={inputStyle}
                                type="password"
                                value={passwords.currentPassword}
                                onChange={e =>
                                    setPasswords({ ...passwords, currentPassword: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: 4,
                                    fontSize: 'var(--font-size-sm)',
                                }}
                            >
                                Nouveau mot de passe
                            </label>
                            <input
                                style={inputStyle}
                                type="password"
                                value={passwords.newPassword}
                                onChange={e =>
                                    setPasswords({ ...passwords, newPassword: e.target.value })
                                }
                                minLength={8}
                                required
                            />
                        </div>
                        <Button type="submit" loading={savingPassword}>
                            Changer le mot de passe
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
