import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  CalendarDays
} from 'lucide-react';

export default function Profile() {
  const { user, updateUserProfile, changeUserPassword, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'security'

  // Personal Info form
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });

  // Security form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const roleColorMap = {
    admin: 'bg-stone-800 text-white border-stone-800',
    staff: 'bg-stone-200 text-stone-800 border-stone-300',
    customer: 'bg-stone-100 text-stone-800 border-stone-200'
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    setIsUpdating(true);

    const res = await updateUserProfile({
      name: profileData.name,
      phone: profileData.phone
    });

    setIsUpdating(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Profile details updated successfully.' });
    } else {
      setFeedback({ type: 'error', message: res.message || 'Failed to update profile' });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters' });
      return;
    }

    setIsUpdating(true);
    const res = await changeUserPassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });

    setIsUpdating(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Password updated successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setFeedback({ type: 'error', message: res.message || 'Failed to change password' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Profile Overview Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          {/* Avatar Icon */}
          <div className="w-16 h-16 rounded-lg bg-stone-900 flex items-center justify-center text-white text-2xl font-serif font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                {user?.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border capitalize ${
                  roleColorMap[user?.role] || roleColorMap.customer
                }`}
              >
                {user?.role} Account
              </span>
            </div>
            
            <p className="text-sm text-stone-500 flex items-center justify-center md:justify-start gap-1">
              <Mail className="w-4 h-4 text-stone-400" />
              {user?.email}
            </p>
            
            <p className="text-xs text-stone-400 flex items-center justify-center md:justify-start gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
            </p>
          </div>
        </div>

        {/* Quick Logout Button */}
        <button
          onClick={logout}
          className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer border border-stone-200"
        >
          <LogOut className="w-4 h-4 mr-1.5" />
          Sign Out
        </button>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200">
          <button
            onClick={() => { setActiveTab('personal'); setFeedback({ type: '', message: '' }); }}
            className={`flex-1 py-4 text-center text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'personal'
                ? 'text-stone-900 border-b-2 border-stone-900 bg-stone-50 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <User className="w-4 h-4" />
            Personal Details
          </button>
          <button
            onClick={() => { setActiveTab('security'); setFeedback({ type: '', message: '' }); }}
            className={`flex-1 py-4 text-center text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'security'
                ? 'text-stone-900 border-b-2 border-stone-900 bg-stone-50 font-bold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Security & Password
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8">
          
          {/* Feedback Alerts */}
          {feedback.message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center space-x-3 text-sm ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {/* TAB 1: Personal Details */}
          {activeTab === 'personal' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:outline-stone-500 focus:border-stone-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">
                  Email Address <span className="text-xs text-stone-400 normal-case">(Immutable)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={profileData.email}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 bg-stone-100 text-stone-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:outline-stone-500 focus:border-stone-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-70"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Profile Details'
                )}
              </button>
            </form>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:outline-stone-500 focus:border-stone-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:outline-stone-500 focus:border-stone-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 uppercase tracking-wide">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    placeholder="Re-type new password"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 focus:outline-stone-500 focus:border-stone-500 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="inline-flex items-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-70"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}
