import { useState, useEffect } from 'react';
import { adminService } from '../../services/admin.service';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  X
} from 'lucide-react';

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('customer');
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        role: roleFilter === 'all' ? undefined : roleFilter,
        search: searchQuery.trim() || undefined
      };
      const res = await adminService.getAllUsers(params);
      if (res?.data?.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to load users' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminService.toggleUserStatus(user._id);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
      );
      setActionFeedback({
        type: 'success',
        message: `Account for ${user.name} marked as ${!user.isActive ? 'Active' : 'Suspended'}.`
      });
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to toggle status' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete user account "${name}"? This action is permanent.`)) return;

    try {
      await adminService.deleteUser(id);
      setActionFeedback({ type: 'success', message: `User "${name}" deleted.` });
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to delete user' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <span>Client Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Registered Clients & Accounts
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            View client booking history, verify account active states, and manage permissions.
          </p>
        </div>

        <span className="text-xs text-stone-600 font-semibold bg-stone-100 px-3.5 py-1.5 rounded-lg border border-stone-200">
          Total Accounts: <strong>{users.length}</strong>
        </span>
      </div>

      {/* Action Notification Alert */}
      {actionFeedback.message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs sm:text-sm ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback({ type: '', message: '' })}
            className="text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Role Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center text-xs">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-medium">Role:</span>
          {['customer', 'staff', 'admin', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize cursor-pointer transition-colors ${
                roleFilter === r
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
            <p className="text-xs text-stone-500">Loading user directory...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3.5 px-6">Client Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Total Bookings</th>
                  <th className="py-3.5 px-4">Member Since</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Name & Initials */}
                    <td className="py-4 px-6 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-stone-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-stone-900">{u.name}</span>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-4 px-4">
                      <p className="flex items-center text-stone-700">
                        <Mail className="w-3 h-3 mr-1 text-stone-400" />
                        {u.email}
                      </p>
                      <p className="flex items-center text-stone-500 text-[11px] mt-0.5">
                        <Phone className="w-3 h-3 mr-1 text-stone-400" />
                        {u.phone}
                      </p>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-200">
                        {u.role}
                      </span>
                    </td>

                    {/* Total Bookings */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-stone-900 font-mono text-sm">
                        {u.appointmentsCount || 0}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-stone-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    {/* Active Status */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </button>
                    </td>

                    {/* Delete Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(u._id, u.name)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-stone-400 italic">No users found.</div>
        )}
      </div>

    </div>
  );
}
