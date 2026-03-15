import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaBirthdayCake,
  FaCamera,
  FaEnvelope,
  FaKey,
  FaPhoneAlt,
  FaSave,
  FaShieldAlt,
  FaSpinner,
  FaSyncAlt,
  FaUserCircle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { auth, profile as profileApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const _RAW_PROFILE_URL = process.env.REACT_APP_API_URL || 'https://127.0.0.1:8000/api';
// Enforce HTTPS for all API calls in production
const _SAFE_PROFILE_URL =
  process.env.NODE_ENV === 'production'
    ? _RAW_PROFILE_URL.replace(/^http:\/\//, 'https://')
    : _RAW_PROFILE_URL;
const API_BASE_URL = _SAFE_PROFILE_URL.replace(/\/api\/?$/, '');

const toAbsoluteAssetUrl = (value) => {
  if (!value || typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  return `${API_BASE_URL}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

const isUserLikePayload = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Boolean(value.id || value.email || value.name);
};

const extractUser = (payload) => {
  const candidate = payload?.user || payload?.data?.user || payload?.data || payload;
  return isUserLikePayload(candidate) ? candidate : null;
};

const getAvatarSource = (value) =>
  toAbsoluteAssetUrl(value?.avatar_url) ||
  toAbsoluteAssetUrl(value?.profile_picture) ||
  toAbsoluteAssetUrl(value?.avatar) ||
  toAbsoluteAssetUrl(value?.image) ||
  '';

const normalizeDateValue = (value) => {
  if (!value) return '';

  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw.slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const mapUserToForm = (value) => ({
  name: value?.name || '',
  email: value?.email || '',
  contactNumber: value?.contact_number || value?.phone_number || '',
  birthDate: normalizeDateValue(value?.birth_date || value?.date_of_birth || ''),
});

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const firstValidationError = (errorData) => {
  const errors = errorData?.errors;
  if (!errors || typeof errors !== 'object') return null;

  const fieldErrors = Object.values(errors);
  if (!Array.isArray(fieldErrors) || fieldErrors.length === 0) return null;
  if (!Array.isArray(fieldErrors[0]) || fieldErrors[0].length === 0) return null;
  return fieldErrors[0][0];
};

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    contactNumber: '',
    birthDate: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const applyUserToForm = useCallback((currentUser) => {
    setProfileForm(mapUserToForm(currentUser || {}));
    setAvatarPreview(getAvatarSource(currentUser || {}));
  }, []);

  useEffect(() => {
    if (user) {
      applyUserToForm(user);
    }
  }, [user, applyUserToForm]);

  useEffect(() => {
    if (location.pathname === '/settings') {
      setActiveTab('security');
    } else {
      setActiveTab('profile');
    }
  }, [location.pathname]);

  const syncProfileFromServer = useCallback(
    async ({ showSuccessToast = false, showErrorToast = false } = {}) => {
      setLoadingProfile(true);

      try {
        const response = await auth.me();
        const apiUser = extractUser(response?.data);

        if (!apiUser) {
          if (showErrorToast) {
            toast.error('Server returned an invalid profile response.');
          }
          return false;
        }

        updateUser(apiUser);
        applyUserToForm(apiUser);
        setAvatarFile(null);

        if (showSuccessToast) {
          toast.success('Profile synced from server.');
        }

        return true;
      } catch (error) {
        if (showErrorToast) {
          toast.error('Unable to sync profile right now.');
        } else {
          console.warn('Unable to refresh profile from backend, using local user data.', error);
        }

        return false;
      } finally {
        setLoadingProfile(false);
      }
    },
    [applyUserToForm, updateUser]
  );

  useEffect(() => {
    syncProfileFromServer();
  }, [syncProfileFromServer]);

  const profileImage = useMemo(() => avatarPreview || getAvatarSource(user || {}), [avatarPreview, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'security' ? '/settings' : '/profile');
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Profile image must be 3MB or less.');
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfileLocally = async () => {
    const baseUser = user || {};
    let localAvatar = profileImage;

    if (avatarFile) {
      localAvatar = await fileToDataUrl(avatarFile);
    }

    const localUser = {
      ...baseUser,
      name: profileForm.name.trim(),
      email: profileForm.email,
      contact_number: profileForm.contactNumber.trim(),
      phone_number: profileForm.contactNumber.trim(),
      birth_date: profileForm.birthDate || null,
      avatar_url: localAvatar || baseUser.avatar_url || '',
      profile_picture: localAvatar || baseUser.profile_picture || '',
    };

    updateUser(localUser);
    applyUserToForm(localUser);
    setAvatarFile(null);
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!profileForm.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    const numberPattern = /^[0-9+()\-\s]{7,20}$/;
    if (profileForm.contactNumber && !numberPattern.test(profileForm.contactNumber)) {
      toast.error('Please provide a valid contact number.');
      return;
    }

    setSavingProfile(true);

    const payload = {
      name: profileForm.name.trim(),
      contact_number: profileForm.contactNumber.trim(),
      phone_number: profileForm.contactNumber.trim(),
      birth_date: profileForm.birthDate || null,
    };

    try {
      const profileResponse = await profileApi.updateProfile(payload);
      const updatedFromServer = extractUser(profileResponse?.data) || {};

      let mergedUser = {
        ...(user || {}),
        ...payload,
        ...updatedFromServer,
      };

      if (avatarFile) {
        try {
          const avatarResponse = await profileApi.uploadAvatar(avatarFile);
          const avatarUser = extractUser(avatarResponse?.data) || {};
          const avatarUrl =
            getAvatarSource(avatarUser) ||
            avatarResponse?.data?.avatar_url ||
            avatarResponse?.data?.data?.avatar_url ||
            '';

          mergedUser = {
            ...mergedUser,
            ...avatarUser,
          };

          if (avatarUrl) {
            mergedUser.avatar_url = avatarUrl;
            mergedUser.profile_picture = avatarUrl;
          }
        } catch (avatarError) {
          const avatarStatus = avatarError?.response?.status;
          if (avatarStatus === 404 || avatarStatus === 405) {
            const localAvatar = await fileToDataUrl(avatarFile);
            mergedUser.avatar_url = localAvatar;
            mergedUser.profile_picture = localAvatar;
            toast.success('Profile image saved locally.');
          } else {
            throw avatarError;
          }
        }
      }

      updateUser(mergedUser);
      applyUserToForm(mergedUser);
      setAvatarFile(null);
      toast.success('Profile updated successfully.');
    } catch (error) {
      const status = error?.response?.status;

      if (status === 404 || status === 405) {
        await saveProfileLocally();
        toast.success('Profile updated locally.');
      } else if (status === 422) {
        toast.error(firstValidationError(error?.response?.data) || 'Validation failed.');
      } else {
        toast.error(error?.response?.data?.message || 'Failed to save profile changes.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordInputChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    const clearPasswordForm = () => {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    };

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill all password fields.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password confirmation does not match.');
      return;
    }

    setSavingPassword(true);

    try {
      await profileApi.changePassword({
        current_password: passwordForm.currentPassword,
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.newPassword,
        new_password: passwordForm.newPassword,
        newPassword: passwordForm.newPassword,
        password_confirmation: passwordForm.confirmPassword,
        new_password_confirmation: passwordForm.confirmPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      clearPasswordForm();
      toast.success('Password updated successfully.');
    } catch (error) {
      const status = error?.response?.status;

      if (status === 404 || status === 405) {
        try {
          await profileApi.updateProfile({
            current_password: passwordForm.currentPassword,
            password: passwordForm.newPassword,
            password_confirmation: passwordForm.confirmPassword,
            new_password: passwordForm.newPassword,
            new_password_confirmation: passwordForm.confirmPassword,
          });

          clearPasswordForm();
          toast.success('Password updated successfully.');
        } catch (fallbackError) {
          const fallbackStatus = fallbackError?.response?.status;

          if (fallbackStatus === 422) {
            toast.error(firstValidationError(fallbackError?.response?.data) || 'Password validation failed.');
          } else {
            toast.error('Password update is not available in backend API routes yet. Please enable a password endpoint.');
          }
        }
      } else if (status === 401) {
        toast.error('Current password is incorrect.');
      } else if (status === 422) {
        toast.error(firstValidationError(error?.response?.data) || 'Password validation failed.');
      } else {
        toast.error(error?.response?.data?.message || 'Failed to update password.');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your personal information, security, and profile photo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/95 rounded-2xl shadow-xl border border-white/50 p-6"
          >
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg flex items-center justify-center">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-4xl font-bold">
                      {(user?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="profile-image-input"
                  className="absolute -bottom-2 -right-2 w-11 h-11 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-lg flex items-center justify-center cursor-pointer hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all"
                  title="Update profile picture"
                >
                  <FaCamera className="w-4 h-4" />
                </label>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-gray-900">{user?.name || 'User'}</h2>
              <p className="text-gray-500 capitalize">{user?.role || 'Student'}</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <button
                onClick={() => handleTabChange('profile')}
                className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <FaUserCircle className="w-4 h-4" />
                  Profile Information
                </span>
              </button>

              <button
                onClick={() => handleTabChange('security')}
                className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-colors ${
                  activeTab === 'security'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <FaShieldAlt className="w-4 h-4" />
                  Security Settings
                </span>
              </button>

              <button
                onClick={() => {
                  syncProfileFromServer({ showSuccessToast: true, showErrorToast: true });
                }}
                disabled={loadingProfile || savingProfile || savingPassword}
                className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-colors disabled:opacity-60"
              >
                <span className="inline-flex items-center gap-2">
                  {loadingProfile ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSyncAlt className="w-4 h-4" />}
                  Sync Profile
                </span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white/95 rounded-2xl shadow-xl border border-white/50 p-6 md:p-8"
          >
            {activeTab === 'profile' ? (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-gray-600 mt-1">
                    Update your name, contact number, birth date, and profile photo.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="inline-flex items-center gap-2">
                        <FaEnvelope className="w-3 h-3 text-gray-500" />
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="inline-flex items-center gap-2">
                        <FaPhoneAlt className="w-3 h-3 text-gray-500" />
                        Contact Number
                      </span>
                    </label>
                    <input
                      type="text"
                      name="contactNumber"
                      value={profileForm.contactNumber}
                      onChange={handleProfileInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your contact number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="inline-flex items-center gap-2">
                        <FaBirthdayCake className="w-3 h-3 text-gray-500" />
                        Birth Date
                      </span>
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={profileForm.birthDate}
                      onChange={handleProfileInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile || loadingProfile}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-2">
                      {savingProfile ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSave className="w-4 h-4" />}
                      {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Security Settings</h3>
                  <p className="text-gray-600 mt-1">Change your account password securely.</p>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-5 py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-60"
                  >
                    <span className="inline-flex items-center gap-2">
                      {savingPassword ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaKey className="w-4 h-4" />}
                      {savingPassword ? 'Updating Password...' : 'Update Password'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
