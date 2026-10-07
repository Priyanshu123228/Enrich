import { useState, useEffect } from 'react';
import { staffService } from '../../services/staff.service';
import { serviceService } from '../../services/service.service';
import {
  Scissors,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Sparkles,
  UserCheck,
  UserX
} from 'lucide-react';
import ImageUpload from '../../components/common/ImageUpload';
import { resolveImageUrl, handleImageError, DEFAULT_AVATAR_PLACEHOLDER } from '../../utils/imageUrl';

export default function AdminStaff() {
  const [staffMembers, setStaffMembers] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [modalTab, setModalTab] = useState('info'); // 'info' | 'services' | 'schedule'

  // Default initial schedule for 7 days
  const defaultSchedule = [
    { dayOfWeek: 0, dayName: 'Sunday', isWorking: false, startTime: '10:00', endTime: '18:00', breakStartTime: '13:00', breakEndTime: '14:00' },
    { dayOfWeek: 1, dayName: 'Monday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00' },
    { dayOfWeek: 2, dayName: 'Tuesday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00' },
    { dayOfWeek: 3, dayName: 'Wednesday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00' },
    { dayOfWeek: 4, dayName: 'Thursday', isWorking: true, startTime: '09:00', endTime: '19:00', breakStartTime: '13:00', breakEndTime: '14:00' },
    { dayOfWeek: 5, dayName: 'Friday', isWorking: true, startTime: '09:00', endTime: '20:00', breakStartTime: '13:00', breakEndTime: '14:00' },
    { dayOfWeek: 6, dayName: 'Saturday', isWorking: true, startTime: '09:00', endTime: '20:00', breakStartTime: '13:00', breakEndTime: '14:00' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatarUrl: '',
    bio: '',
    experience: '5',
    status: 'active',
    specializationText: '',
    selectedServices: [],
    schedule: defaultSchedule
  });

  const [formErrors, setFormErrors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [staffRes, servicesRes] = await Promise.all([
        staffService.getStaff(),
        serviceService.getServices({ limit: 100 })
      ]);

      if (staffRes?.data) setStaffMembers(staffRes.data);
      if (servicesRes?.data?.services) setAvailableServices(servicesRes.data.services);
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to load staff roster' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingStaffId(null);
    setModalTab('info');
    setFormData({
      name: '',
      email: '',
      phone: '',
      avatarUrl: '',
      bio: '',
      experience: '5',
      status: 'active',
      specializationText: 'Hair Styling, Hair Care',
      selectedServices: [],
      schedule: defaultSchedule
    });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaffId(staff._id);
    setModalTab('info');

    // Reconstruct full schedule mapping
    const fullSchedule = defaultSchedule.map((d) => {
      const existing = staff.schedule?.find((s) => s.dayOfWeek === d.dayOfWeek);
      return existing || d;
    });

    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      avatarUrl: staff.avatar?.url || (typeof staff.avatar === 'string' ? staff.avatar : '') || '',
      bio: staff.bio || '',
      experience: staff.experience?.toString() || '0',
      status: staff.status || 'active',
      specializationText: staff.specialization?.join(', ') || '',
      selectedServices: staff.services?.map((s) => (s._id ? s._id : s)) || [],
      schedule: fullSchedule
    });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormErrors([]);

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      experience: parseInt(formData.experience, 10) || 0,
      status: formData.status,
      avatar: formData.avatarUrl ? { url: formData.avatarUrl } : undefined,
      specialization: formData.specializationText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
      services: formData.selectedServices,
      schedule: formData.schedule
    };

    try {
      if (editingStaffId) {
        await staffService.updateStaff(editingStaffId, payload);
        setActionFeedback({ type: 'success', message: 'Stylist information updated successfully.' });
      } else {
        await staffService.createStaff(payload);
        setActionFeedback({ type: 'success', message: 'New stylist added successfully.' });
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setFormErrors(err.errors?.length ? err.errors : [err.message || 'Operation failed']);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove staff member "${name}"?`)) return;

    try {
      await staffService.deleteStaff(id);
      setActionFeedback({ type: 'success', message: `Staff member "${name}" removed.` });
      setStaffMembers((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to delete staff member' });
    }
  };

  const handleStatusChange = async (staffId, newStatus) => {
    try {
      await staffService.updateStaff(staffId, { status: newStatus });
      setStaffMembers((prev) =>
        prev.map((s) => (s._id === staffId ? { ...s, status: newStatus } : s))
      );
      setActionFeedback({ type: 'success', message: `Status updated to ${newStatus}.` });
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message });
    }
  };

  const toggleServiceSelection = (serviceId) => {
    setFormData((prev) => {
      const exists = prev.selectedServices.includes(serviceId);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter((id) => id !== serviceId)
          : [...prev.selectedServices, serviceId]
      };
    });
  };

  const handleScheduleChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedSchedule = [...prev.schedule];
      updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
      return { ...prev, schedule: updatedSchedule };
    });
  };

  // Filtered staff
  const filteredStaff = staffMembers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <span>Staff Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Stylists & Beauticians Roster
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Manage stylists, assign qualified treatments, and configure weekly shift schedules.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Stylist
        </button>
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex justify-between items-center">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by stylist name or email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
          />
        </div>

        <span className="text-xs text-stone-500 font-medium">
          Total Stylists: <strong>{staffMembers.length}</strong>
        </span>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
            <p className="text-xs text-stone-500">Loading staff roster...</p>
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3.5 px-6">Stylist</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">Specialization</th>
                  <th className="py-3.5 px-4">Services Assigned</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                {filteredStaff.map((staff) => (
                  <tr key={staff._id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Stylist info */}
                    <td className="py-4 px-6 flex items-center space-x-3">
                      <img
                        src={resolveImageUrl(staff.avatar?.url || staff.avatar, DEFAULT_AVATAR_PLACEHOLDER)}
                        alt={staff.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-200"
                      />
                      <div>
                        <p className="font-semibold text-stone-900">{staff.name}</p>
                        <p className="text-[11px] text-stone-400">{staff.email}</p>
                      </div>
                    </td>

                    {/* Experience */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-stone-900">{staff.experience} Years</span>
                    </td>

                    {/* Specializations */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {staff.specialization?.slice(0, 2).map((s, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[10px] font-medium border border-stone-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Assigned Services Count */}
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded bg-stone-100 text-stone-800 font-semibold text-[11px] border border-stone-200">
                        {staff.services?.length || 0} Services
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-4">
                      <select
                        value={staff.status}
                        onChange={(e) => handleStatusChange(staff._id, e.target.value)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold border text-xs cursor-pointer ${
                          staff.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : staff.status === 'on_leave'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Edit Stylist"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(staff._id, staff.name)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Stylist"
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
          <div className="p-12 text-center space-y-3">
            <p className="text-sm text-stone-500">No staff members found.</p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT STAFF MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 sm:p-8 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {editingStaffId ? `Edit ${formData.name}'s Profile` : 'Add New Stylist'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-stone-200 mt-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalTab('info')}
                className={`py-2.5 px-4 border-b-2 cursor-pointer transition-colors ${
                  modalTab === 'info'
                    ? 'border-stone-900 text-stone-900 font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Basic Profile
              </button>
              <button
                type="button"
                onClick={() => setModalTab('services')}
                className={`py-2.5 px-4 border-b-2 cursor-pointer transition-colors ${
                  modalTab === 'services'
                    ? 'border-stone-900 text-stone-900 font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                2. Assign Services ({formData.selectedServices.length})
              </button>
              <button
                type="button"
                onClick={() => setModalTab('schedule')}
                className={`py-2.5 px-4 border-b-2 cursor-pointer transition-colors ${
                  modalTab === 'schedule'
                    ? 'border-stone-900 text-stone-900 font-bold'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                3. Shift Hours Schedule
              </button>
            </div>

            {formErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs space-y-1">
                {formErrors.map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="mt-6 space-y-4 text-xs">
              
              {/* TAB 1: BASIC PROFILE */}
              {modalTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold uppercase text-stone-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Elena Vance"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-stone-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="elena@luxeparlour.com"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold uppercase text-stone-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(212) 555-0192"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-stone-700 mb-1">
                        Experience (Years) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        placeholder="8"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold uppercase text-stone-700 mb-1">
                        Roster Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500 bg-white"
                      >
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <ImageUpload
                      value={formData.avatarUrl}
                      onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                      label="Stylist Profile Photo"
                      isCircular={true}
                      helpText="Click to select or drop portrait photo (JPG, PNG, WEBP)"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">
                      Specializations (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.specializationText}
                      onChange={(e) => setFormData({ ...formData, specializationText: e.target.value })}
                      placeholder="Balayage, Facial Treatments, Bridal Makeup"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">
                      Bio & Background *
                    </label>
                    <textarea
                      rows="3"
                      required
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Stylist credentials, specialization, and experience..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ASSIGN SERVICES */}
              {modalTab === 'services' && (
                <div className="space-y-3">
                  <p className="text-stone-500 text-[11px]">
                    Select the treatments this stylist is qualified to perform.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                    {availableServices.map((service) => {
                      const isSelected = formData.selectedServices.includes(service._id);
                      return (
                        <div
                          key={service._id}
                          onClick={() => toggleServiceSelection(service._id)}
                          className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-stone-50 border-stone-900 shadow-xs ring-1 ring-stone-900'
                              : 'bg-white border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <p className="font-semibold text-stone-900 line-clamp-1">{service.name}</p>
                            <div className="flex items-center space-x-2 text-[10px] text-stone-500">
                              <span className="font-medium text-stone-700">{service.category}</span>
                              <span>•</span>
                              <span>${service.price}</span>
                              <span>•</span>
                              <span>{service.duration}m</span>
                            </div>
                          </div>

                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Controlled by container onClick
                            className="rounded text-stone-900 focus:ring-stone-500 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: SHIFT SCHEDULE */}
              {modalTab === 'schedule' && (
                <div className="space-y-3">
                  <p className="text-stone-500 text-[11px]">
                    Configure working days and shift windows used by the booking system.
                  </p>

                  <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg overflow-hidden">
                    {formData.schedule.map((day, idx) => (
                      <div key={day.dayOfWeek} className="p-3 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-3 w-32">
                          <input
                            type="checkbox"
                            id={`day-${day.dayOfWeek}`}
                            checked={day.isWorking}
                            onChange={(e) => handleScheduleChange(idx, 'isWorking', e.target.checked)}
                            className="rounded text-stone-900 focus:ring-stone-500 cursor-pointer"
                          />
                          <label htmlFor={`day-${day.dayOfWeek}`} className="font-semibold text-stone-800 cursor-pointer">
                            {day.dayName}
                          </label>
                        </div>

                        {day.isWorking ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-1">
                              <span className="text-[10px] text-stone-400">Shift:</span>
                              <input
                                type="time"
                                value={day.startTime}
                                onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                                className="px-2 py-1 rounded border border-stone-300 text-xs"
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={day.endTime}
                                onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                                className="px-2 py-1 rounded border border-stone-300 text-xs"
                              />
                            </div>

                            <div className="flex items-center space-x-1 pl-2 border-l border-stone-200">
                              <span className="text-[10px] text-stone-400">Break:</span>
                              <input
                                type="time"
                                value={day.breakStartTime}
                                onChange={(e) => handleScheduleChange(idx, 'breakStartTime', e.target.value)}
                                className="px-2 py-1 rounded border border-stone-300 text-xs"
                              />
                              <span>to</span>
                              <input
                                type="time"
                                value={day.breakEndTime}
                                onChange={(e) => handleScheduleChange(idx, 'breakEndTime', e.target.value)}
                                className="px-2 py-1 rounded border border-stone-300 text-xs"
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-xs italic">Off Duty</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="pt-4 flex justify-between items-center border-t border-stone-100">
                <div className="text-[11px] text-stone-500">
                  {modalTab === 'info' ? 'Next: Assign services' : modalTab === 'services' ? 'Next: Set shift schedule' : 'Ready to save'}
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors cursor-pointer disabled:opacity-70 flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        Saving...
                      </>
                    ) : editingStaffId ? (
                      'Save Stylist Changes'
                    ) : (
                      'Save Stylist'
                    )}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
