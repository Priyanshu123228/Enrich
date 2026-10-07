import { useState, useEffect } from 'react';
import { serviceService } from '../../services/service.service';
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Tag
} from 'lucide-react';
import ImageUpload from '../../components/common/ImageUpload';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(['Hair', 'Skin', 'Makeup', 'Nails', 'Spa', 'Bridal']);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });

  // Create / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hair',
    price: '',
    discountPrice: '',
    duration: '',
    description: '',
    featuresText: '',
    imageUrl: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await serviceService.getServices({ limit: 100 });
      if (res?.data?.services) {
        setServices(res.data.services);
      }
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to fetch services' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreateModal = () => {
    setEditingServiceId(null);
    setFormData({
      name: '',
      category: 'Hair',
      price: '',
      discountPrice: '',
      duration: '45',
      description: '',
      featuresText: '',
      imageUrl: '',
      isActive: true
    });
    setFormErrors([]);
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingServiceId(service._id);
    setFormData({
      name: service.name || '',
      category: service.category || 'Hair',
      price: service.price || '',
      discountPrice: service.discountPrice || '',
      duration: service.duration || '',
      description: service.description || '',
      featuresText: service.features?.join('\n') || '',
      imageUrl: service.images?.[0]?.url || (typeof service.images?.[0] === 'string' ? service.images[0] : '') || service.image || '',
      isActive: service.isActive !== undefined ? service.isActive : true
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
      category: formData.category,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : 0,
      duration: parseInt(formData.duration, 10),
      description: formData.description,
      features: formData.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0),
      images: formData.imageUrl ? [{ url: formData.imageUrl }] : [],
      isActive: formData.isActive
    };

    try {
      if (editingServiceId) {
        await serviceService.updateService(editingServiceId, payload);
        setActionFeedback({ type: 'success', message: 'Service updated successfully.' });
      } else {
        await serviceService.createService(payload);
        setActionFeedback({ type: 'success', message: 'Service created successfully.' });
      }
      setIsModalOpen(false);
      await fetchServices();
    } catch (err) {
      setFormErrors(err.errors || [err.message || 'Failed to save service']);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await serviceService.deleteService(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
      setActionFeedback({ type: 'success', message: `Service "${name}" was deleted.` });
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to delete service' });
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      await serviceService.updateService(service._id, { isActive: !service.isActive });
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? { ...s, isActive: !s.isActive } : s))
      );
      setActionFeedback({
        type: 'success',
        message: `Service marked as ${!service.isActive ? 'Active' : 'Inactive'}.`
      });
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message });
    }
  };

  // Filtered list
  const filteredServices = services.filter((s) => {
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <span>Service Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Salon Services Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Create, update pricing, adjust duration, and manage public catalogue availability.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New Service
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

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                categoryFilter === cat
                  ? 'bg-stone-900 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
            <p className="text-xs text-stone-500">Loading catalog...</p>
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3.5 px-6">Service</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                {filteredServices.map((service) => (
                  <tr key={service._id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Thumbnail & Title */}
                    <td className="py-4 px-6 flex items-center space-x-3">
                      <img
                        src={resolveImageUrl(service.images?.[0]?.url || service.images?.[0], DEFAULT_SALON_PLACEHOLDER)}
                        alt={service.name}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-200"
                      />
                      <div>
                        <p className="font-semibold text-stone-900 line-clamp-1">{service.name}</p>
                        <p className="text-[11px] text-stone-400 line-clamp-1">{service.description}</p>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-800 border border-stone-200">
                        {service.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-stone-900">${service.price}</span>
                      {service.discountPrice > 0 && (
                        <span className="text-[10px] text-emerald-700 block">
                          Sale: ${service.discountPrice}
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center text-stone-600">
                        <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                        {service.duration}m
                      </span>
                    </td>

                    {/* Active Status Toggle */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(service)}
                        className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                          service.isActive
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Edit Service"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service._id, service.name)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Service"
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
            <p className="text-sm text-stone-500">No services found.</p>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-stone-100">
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {editingServiceId ? 'Edit Service Details' : 'Create New Service'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Deep Conditioning & Blowout"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Regular Price ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="85"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Discount Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="75 (optional)"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">
                    Duration (Mins) *
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="60"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                  />
                </div>
              </div>

              <div>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  label="Service Showcase Image"
                  aspectRatio="aspect-video"
                  helpText="Click to select or drop treatment photo (JPG, PNG, WEBP)"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Accurate description of the treatment..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Features / Steps Included (One per line)
                </label>
                <textarea
                  rows="3"
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="Consultation&#10;Deep wash & conditioning&#10;Styling finish"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-stone-900 focus:ring-stone-500 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-stone-700 font-medium cursor-pointer">
                  Make Service Available For Public Booking
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100">
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
                  ) : editingServiceId ? (
                    'Update Service'
                  ) : (
                    'Create Service'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
