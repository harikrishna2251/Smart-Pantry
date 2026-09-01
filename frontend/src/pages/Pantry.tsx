import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserPantry, consumeProduct } from '../services/dbService';
import type { PantryItem } from '../services/dbService';
import { Package, Minus, Calendar } from 'lucide-react';

const Pantry: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    if (!currentUser) return;
    try {
      const data = await getUserPantry(currentUser.uid);
      setItems(data);
    } catch (e) {
      console.error(e);
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
    const diffTime = Math.abs(new Date(expiryDate).getTime() - new Date().getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-slate-800">My Pantry</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {items.length} items
        </span>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading inventory...</p>
      ) : items.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">Your pantry is empty</h3>
          <p className="text-slate-500 mt-2">Scan a product to add it to your inventory.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
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
