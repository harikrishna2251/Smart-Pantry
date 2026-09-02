import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPantry, consumeProduct } from '../services/dbService';
import type { PantryItem } from '../services/dbService';
import { Package, Minus, Calendar, AlertTriangle, FilterX, Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Pantry: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const filterType = searchParams.get('filter');

  const fetchItems = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      const data = await getUserPantry(currentUser.uid);
      setItems(data);
    } catch (e: any) {
      console.error(e);
      alert("Error loading pantry: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [currentUser]);

  const handleUse = async (item: PantryItem) => {
    const amountStr = prompt(`How many ${item.name} are you using? (Max: ${item.quantityRemaining})`, "1");
    if (!amountStr) return;
    
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0 || amount > item.quantityRemaining) {
      alert("Invalid amount!");
      return;
    }

    try {
      await consumeProduct(item.id!, item.quantityRemaining, amount);
      // Refresh list to show updated quantities
      fetchItems();
    } catch (e) {
      alert("Failed to update inventory.");
    }
  };

  const getDaysLeft = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const displayedItems = items.filter(item => {
    if (item.quantityRemaining <= 0) return false;
    if (!filterType) return true;
    
    const daysLeft = getDaysLeft(item.expiryDate);
    if (filterType === 'expired') return daysLeft < 0;
    if (filterType === 'expiring') return daysLeft >= 0 && daysLeft <= 7;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">My Pantry</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {displayedItems.length} items
        </span>
      </div>

      {filterType && (
        <div className="flex items-center justify-between bg-orange-50 border border-orange-200 p-3 rounded-xl">
          <span className="text-orange-700 font-medium text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> 
            Showing {filterType === 'expired' ? 'Expired' : 'Expiring Soon'} items
          </span>
          <button 
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1 text-sm bg-white border border-orange-200 px-3 py-1 rounded-lg text-orange-600 hover:bg-orange-100"
          >
            <FilterX size={14} /> Clear
          </button>
        </div>
      )}

      {displayedItems.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No items found</h3>
          <p className="text-slate-500 mt-2">Try clearing your filters or adding new items.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {displayedItems.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
              
              {/* Product Image */}
              <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="text-slate-400" />
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 text-center md:text-left">
                <h4 className="font-bold text-lg text-slate-800">{item.name}</h4>
                <p className="text-sm text-slate-500">{item.brand} • {item.category}</p>
                <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded font-medium">
                    {item.quantityRemaining} Remaining
                  </span>
                  <span className={`text-xs px-2 py-1 rounded font-medium flex items-center gap-1 ${
                    getDaysLeft(item.expiryDate) <= 7 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    <Calendar size={12} />
                    Expires: {item.expiryDate}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={() => handleUse(item)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-medium transition-colors"
                >
                  <Minus size={16} />
                  <span>Use</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pantry;
