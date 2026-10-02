import { useState, useEffect } from 'react';
import { serviceService } from '../services/service.service';
import ServiceCard from '../components/services/ServiceCard';
import {
  Search,
  SlidersHorizontal,
  AlertCircle,
  Database,
  ArrowUpDown
} from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([
    { name: 'All', count: 0 },
    { name: 'Hair', count: 0 },
    { name: 'Skin', count: 0 },
    { name: 'Makeup', count: 0 },
    { name: 'Nails', count: 0 },
    { name: 'Spa', count: 0 },
    { name: 'Bridal', count: 0 }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await serviceService.getCategories();
      if (res?.data) {
        const totalCount = res.data.reduce((sum, item) => sum + item.count, 0);
        setCategories([{ name: 'All', count: totalCount }, ...res.data]);
      }
    } catch (err) {
      console.error('Failed to load categories:', err.message);
    }
  };

  // Fetch Services with query parameters
  const fetchServices = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = {
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        sortBy
      };

      const res = await serviceService.getServices(params);
      if (res?.data?.services) {
        setServices(res.data.services);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch services. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchServices();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery, sortBy]);

  // One-click Seed Sample Data
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await serviceService.seedDefaultServices();
      await fetchCategories();
      await fetchServices();
    } catch (err) {
      alert(`Seed failed: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold tracking-widest text-rose-700 uppercase">
          Service Menu & Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Salon Services
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Browse our hair, skin, makeup, nail, and bridal services. Each service is performed by our licensed team in Manhattan.
        </p>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by treatment or service name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-rose-600 focus:border-rose-600 text-sm"
          />
        </div>

        {/* Sort & Action Controls */}
        <div className="w-full md:w-auto flex flex-wrap items-center gap-3 justify-end">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <ArrowUpDown className="w-4 h-4 text-stone-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort services"
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-xs font-medium text-stone-700 focus:outline-rose-600 cursor-pointer"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="duration-asc">Duration: Shortest</option>
              <option value="duration-desc">Duration: Longest</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {services.length === 0 && !isLoading && (
            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-semibold bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-300 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 mr-1.5" />
              {isSeeding ? 'Populating...' : 'Seed Sample Catalog'}
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs (Rectangular chips) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === cat.name
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <span>{cat.name}</span>
            {cat.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  selectedCategory === cat.name
                    ? 'bg-rose-700 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}
              >
                {cat.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-stone-200 p-6 h-96 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-44 bg-stone-200 rounded-lg w-full" />
                <div className="h-5 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-200 rounded w-full" />
              </div>
              <div className="h-10 bg-stone-200 rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">No Services Found</h3>
          <p className="text-xs text-stone-600">
            We could not find any services matching "{searchQuery || selectedCategory}". Try selecting another category or click below to seed starter services.
          </p>
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="inline-flex items-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 mr-2 text-rose-300" />
            {isSeeding ? 'Populating Sample Catalog...' : 'Seed Sample Catalog Now'}
          </button>
        </div>
      )}

    </div>
  );
}
