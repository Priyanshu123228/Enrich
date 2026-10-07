import { useState, useEffect } from 'react';
import { offerService } from '../../services/offer.service';
import { serviceService } from '../../services/service.service';
import {
  Gift,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Calendar,
  Percent,
  DollarSign,
  Tag,
  Layers,
  Search,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import ImageUpload from '../../components/common/ImageUpload';
import { resolveImageUrl, handleImageError, DEFAULT_SALON_PLACEHOLDER } from '../../utils/imageUrl';

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [services, setServices] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    offerType: 'discount',
    code: '',
    discountType: 'percentage',
    discountValue: '20',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    minBookingAmount: '50',
    maxDiscountAmount: '100',
    applicableServices: [],
    isAllServices: true,
    badgeText: 'Special Offer',
    bannerImage: '',
    usageLimit: '100',
    isActive: true
  });
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchOffersAndServices = async () => {
    setIsLoading(true);
    try {
      const [offerRes, servRes] = await Promise.all([
        offerService.getAllOffers({
          offerType: typeFilter !== 'all' ? typeFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }),
        serviceService.getAllServices()
      ]);

      if (offerRes?.data) setOffers(Array.isArray(offerRes.data) ? offerRes.data : offerRes.data.offers || []);
      if (servRes?.data) setServices(Array.isArray(servRes.data) ? servRes.data : servRes.data.services || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load offers and services' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffersAndServices();
  }, [typeFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      offerType: 'discount',
      code: '',
      discountType: 'percentage',
      discountValue: '20',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      minBookingAmount: '50',
      maxDiscountAmount: '100',
      applicableServices: [],
      isAllServices: true,
      badgeText: 'Special Offer',
      bannerImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
      usageLimit: '100',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (offer) => {
    setEditingId(offer._id);
    setFormData({
      title: offer.title,
      description: offer.description || '',
      offerType: offer.offerType || 'discount',
      code: offer.code,
      discountType: offer.discountType,
      discountValue: offer.discountValue.toString(),
      startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : offer.validTill ? new Date(offer.validTill).toISOString().split('T')[0] : '',
      minBookingAmount: offer.minBookingAmount?.toString() || '0',
      maxDiscountAmount: offer.maxDiscountAmount?.toString() || '100',
      applicableServices: offer.applicableServices?.map((s) => (typeof s === 'object' ? s._id : s)) || [],
      isAllServices: offer.isAllServices !== false,
      badgeText: offer.badgeText || 'Special Offer',
      bannerImage: offer.bannerImage || '',
      usageLimit: offer.usageLimit?.toString() || '100',
      isActive: offer.isActive
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        discountValue: Number(formData.discountValue),
        minBookingAmount: Number(formData.minBookingAmount) || 0,
        maxDiscountAmount: Number(formData.maxDiscountAmount) || 1000,
        usageLimit: Number(formData.usageLimit) || 100,
        applicableServices: formData.isAllServices ? [] : formData.applicableServices
      };

      if (editingId) {
        await offerService.updateOffer(editingId, payload);
        setFeedback({ type: 'success', message: 'Offer updated successfully.' });
      } else {
        await offerService.createOffer(payload);
        setFeedback({ type: 'success', message: 'New offer created successfully.' });
      }
      setIsModalOpen(false);
      await fetchOffersAndServices();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save offer' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await offerService.toggleStatus(id);
      setOffers((prev) =>
        prev.map((o) => (o._id === id ? { ...o, isActive: !o.isActive } : o))
      );
      setFeedback({ type: 'success', message: 'Offer status updated.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to toggle status' });
    }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Are you sure you want to permanently delete offer code "${code}"?`)) return;
    try {
      await offerService.deleteOffer(id);
      setFeedback({ type: 'success', message: `Offer "${code}" deleted.` });
      setOffers((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete offer' });
    }
  };

  const handleServiceCheckboxToggle = (serviceId) => {
    setFormData((prev) => {
      const exists = prev.applicableServices.includes(serviceId);
      const updated = exists
        ? prev.applicableServices.filter((id) => id !== serviceId)
        : [...prev.applicableServices, serviceId];
      return { ...prev, applicableServices: updated };
    });
  };

  const filteredOffers = offers.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.code?.toLowerCase().includes(q) ||
      o.title?.toLowerCase().includes(q) ||
      o.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <span>Promotion Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Offers, Packages & Promos
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Create discount vouchers, service packages, and seasonal promos.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Offer
        </button>
      </div>

      {/* Global Notification Alert */}
      {feedback.message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs sm:text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="text-stone-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code or title..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white cursor-pointer"
          >
            <option value="all">All Offer Types</option>
            <option value="discount">Discount Offers</option>
            <option value="package">Service Packages</option>
            <option value="seasonal">Seasonal Specials</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
            <p className="text-xs text-stone-500">Loading offers...</p>
          </div>
        ) : filteredOffers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3.5 px-6">Coupon Code</th>
                  <th className="py-3.5 px-4">Offer Title & Type</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Scope</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredOffers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-stone-900 text-sm">
                      {offer.code}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-stone-900">{offer.title}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                          {offer.offerType || 'discount'}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{offer.description}</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-stone-900">
                      {offer.discountType === 'percentage'
                        ? `${offer.discountValue}% OFF`
                        : `$${offer.discountValue} FLAT`}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-medium border border-stone-200">
                        {offer.isAllServices ? 'All Services' : `${offer.applicableServices?.length || 0} Specific`}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-stone-500 font-mono text-[11px]">
                      {new Date(offer.endDate || offer.validTill).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleToggleStatus(offer._id)}
                        className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer border ${
                          offer.isActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-stone-100 text-stone-500 border-stone-200'
                        }`}
                      >
                        {offer.isActive ? (
                          <>
                            <Eye className="w-3 h-3 mr-1 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1 text-stone-400" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(offer)}
                        className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
                        title="Edit Offer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(offer._id, offer.code)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Delete Offer"
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
          <div className="p-12 text-center text-stone-400 italic">No offers found matching filters.</div>
        )}
      </div>

      {/* CREATE / EDIT OFFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                {editingId ? 'Edit Offer' : 'Create New Offer'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              
              {/* Offer Type Selector */}
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Campaign Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, offerType: 'discount', badgeText: 'Special Discount' })}
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1 font-semibold cursor-pointer ${
                      formData.offerType === 'discount'
                        ? 'bg-stone-900 border-stone-900 text-white'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" /> Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, offerType: 'package', badgeText: 'Service Package' })}
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1 font-semibold cursor-pointer ${
                      formData.offerType === 'package'
                        ? 'bg-stone-900 border-stone-900 text-white'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Package
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, offerType: 'seasonal', badgeText: 'Seasonal Special' })}
                    className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1 font-semibold cursor-pointer ${
                      formData.offerType === 'seasonal'
                        ? 'bg-stone-900 border-stone-900 text-white'
                        : 'bg-white border-stone-200 text-stone-700'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" /> Seasonal
                  </button>
                </div>
              </div>

              {/* Title & Code */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. WELCOME10"
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300 uppercase font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="e.g. Special Offer"
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Offer Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Facial & Hair Care Special"
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe offer details..."
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300"
                />
              </div>

              {/* Discount Rules */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minBookingAmount}
                    onChange={(e) => setFormData({ ...formData, minBookingAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              {/* Date Ranges */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase text-stone-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              {/* Banner Image Direct Upload */}
              <div>
                <ImageUpload
                  value={formData.bannerImage}
                  onChange={(url) => setFormData({ ...formData, bannerImage: url })}
                  label="Offer Banner Image"
                  aspectRatio="aspect-video"
                  helpText="Upload banner graphic or photo (JPG, PNG, WEBP)"
                />
              </div>

              {/* Applicable Services Scope */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold uppercase text-stone-700 text-[11px]">
                    Applicable Treatments
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAllServices}
                      onChange={(e) => setFormData({ ...formData, isAllServices: e.target.checked })}
                      className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                    />
                    <span className="text-[11px] font-semibold text-stone-800">All Treatments</span>
                  </label>
                </div>

                {!formData.isAllServices && (
                  <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-white rounded-lg border border-stone-200">
                    {services.map((s) => (
                      <label key={s._id} className="flex items-center space-x-2 text-stone-700 cursor-pointer hover:bg-stone-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={formData.applicableServices.includes(s._id)}
                          onChange={() => handleServiceCheckboxToggle(s._id)}
                          className="rounded text-stone-900 focus:ring-stone-500"
                        />
                        <span>{s.name} (${s.price})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-stone-300 text-stone-900 focus:ring-stone-500"
                  />
                  <span className="font-semibold text-stone-700">Active (Visible on Customer Site)</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Saving...' : editingId ? 'Update Offer' : 'Save Offer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
