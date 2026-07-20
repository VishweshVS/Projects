import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Tag, Clock } from 'lucide-react';
import api from '../services/api.js';

const HolidayCalendar = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getHolidaysData = async () => {
      try {
        const response = await api.get('/holidays/list');
        // Handle both raw arrays or wrapped object responses safely
        if (response && Array.isArray(response.data)) {
          setHolidays(response.data);
        } else if (response && response.data && Array.isArray(response.data.data)) {
          setHolidays(response.data.data);
        } else {
          setHolidays([]);
        }
      } catch (err) {
        console.error("Rendering Sync Failure:", err);
        setError("The data stream cleared but could not map fields cleanly.");
      } finally {
        setLoading(false);
      }
    };
    getHolidaysData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium">
        <span className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2 vertical-middle"></span>
        Streaming Corporate Calendars...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
          <CalendarIcon size={18} className="text-indigo-600" /> Standard Holiday Schedule
        </h3>
        <p className="text-sm text-gray-500 mb-6">Official system holidays synchronized directly from enterprise operations.</p>

        {holidays.length === 0 ? (
          <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
            No active holiday records found in database arrays.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {holidays.map((holiday) => {
              // Safety fallback parsing values to prevent interface breakdown
              const dateVal = holiday.holiday_date || holiday.date || 'N/A';
              const titleVal = holiday.title || holiday.name || 'Untitled Holiday';
              const typeVal = holiday.type || 'Public';

              return (
                <div key={holiday.id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 transition shadow-sm relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold font-mono tracking-wide text-slate-400 uppercase flex items-center gap-1">
                        <Clock size={12} /> {dateVal}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        typeVal === 'Public' ? 'bg-red-50 text-red-600 border border-red-100' :
                        typeVal === 'Company' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 
                        'bg-amber-50 text-amber-600 border border-amber-100'
                      } border`}>
                        {typeVal}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-base mb-1">{titleVal}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{holiday.description || 'No additional details provided.'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HolidayCalendar;