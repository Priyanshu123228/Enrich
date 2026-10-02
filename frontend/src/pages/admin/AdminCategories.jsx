import { useState, useEffect } from 'react';
import { categoryService } from '../../services/category.service';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    order: '0',
    isActive: true
  });
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await categoryService.getCategories();
      if (res?.data) {
        setCategories(res.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load categories' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      order: '0',
      isActive: true
    });
    setFeedback({ type: '', message: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat._id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      order: cat.order?.toString() || '0',
      isActive: cat.isActive
    });
    setFeedback({ type: '', message: '' });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, formData);
        setFeedback({ type: 'success', message: 'Category updated successfully.' });
      } else {
        await categoryService.createCategory(formData);
        setFeedback({ type: 'success', message: 'New category created successfully.' });
      }
      setIsModalOpen(false);
      await fetchCategories();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save category' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await categoryService.deleteCategory(id);
      setFeedback({ type: 'success', message: `Category "${name}" deleted.` });
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete category' });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <span>Department Organization</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Service Categories
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Organize salon service categories (Hair, Skin, Makeup, Nails, Spa, Bridal).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Category
        </button>
      </div>

      {/* Notification Alert */}
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
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Categories Grid */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
          <p className="text-xs text-stone-500">Loading categories...</p>
        </div>
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:border-stone-300 transition-colors p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center font-bold">
                    <Tag className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-stone-100 text-stone-800 border border-stone-200">
                    {cat.serviceCount || 0} Services
                  </span>
                </div>

                <h3 className="text-xl font-bold font-serif text-stone-900">{cat.name}</h3>
                <p className="text-xs text-stone-500 line-clamp-2">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs mt-4">
                <span className="text-stone-400 font-mono">Order: {cat.order || 0}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-400 italic">
          No categories found. Click "Add Category" to create your first department.
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                {editingId ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bridal & Glamour"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this department..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                />
              </div>

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
                  className="px-6 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
