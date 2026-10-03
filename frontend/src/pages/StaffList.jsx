import { useState, useEffect } from 'react';
import { staffService } from '../services/staff.service';
import StaffCard from '../components/staff/StaffCard';
import {
  Search,
  Users,
  AlertCircle,
  Database
} from 'lucide-react';

export default function StaffList() {
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filterOptions = ['All', 'Hair Styling', 'Facials', 'Bridal', 'Coloring', 'Spa & Massage'];

  const fetchStaff = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = {
        search: searchQuery.trim() || undefined,
        specialization: selectedSpecialization === 'All' ? undefined : selectedSpecialization
      };
      const res = await staffService.getStaff(params);
      if (res?.data) {
        setStaffList(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to fetch staff roster');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStaff();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedSpecialization]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await staffService.seedDefaultStaff();
      await fetchStaff();
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
          Stylist Directory
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">
          Our Salon Stylists
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          Our team of licensed cosmetologists and aestheticians provide personalized treatments at our Sikar, Rajasthan location.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stylists by name or specialization..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-rose-600 focus:border-rose-600 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setSelectedSpecialization(opt)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSpecialization === opt
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Staff Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-stone-200 p-6 h-96 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="h-48 bg-stone-200 rounded-lg w-full" />
                <div className="h-5 bg-stone-200 rounded w-3/4" />
                <div className="h-4 bg-stone-200 rounded w-full" />
              </div>
              <div className="h-10 bg-stone-200 rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : staffList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {staffList.map((staff) => (
            <StaffCard key={staff._id} staff={staff} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">No Stylists Found</h3>
          <p className="text-xs text-stone-600">
            We could not find any beauticians matching your search. Click below to populate default stylists.
          </p>
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="inline-flex items-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4 mr-2 text-rose-300" />
            {isSeeding ? 'Populating...' : 'Seed Sample Stylist Roster'}
          </button>
        </div>
      )}

    </div>
  );
}
