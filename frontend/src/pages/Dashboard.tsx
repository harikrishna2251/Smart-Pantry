import React, { useEffect, useState } from 'react';
import { ScanLine, Plus, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserPantry } from '../services/dbService';
import type { PantryItem } from '../services/dbService';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const displayName = currentUser?.email ? currentUser.email.split('@')[0] : 'User';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  useEffect(() => {
    if (currentUser) {
      getUserPantry(currentUser.uid)
        .then(data => setItems(data))
        .catch(e => console.error("Error loading dashboard data", e))
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  // Calculate dynamic stats
  const totalTypes = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantityRemaining, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let expiringSoonCount = 0;
  let criticalCount = 0;
  let expiredCount = 0;
  let safeCount = 0;

  const getDaysLeft = (expiryDate: string) => {
    const exp = new Date(expiryDate);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const processedItems = items.map(item => {
    const daysLeft = getDaysLeft(item.expiryDate);
    let status = 'SAFE';
    
    if (daysLeft < 0) {
      status = 'EXPIRED';
      expiredCount++;
    } else if (daysLeft <= 3) {
      status = 'CRITICAL';
      criticalCount++;
    } else if (daysLeft <= 7) {
      status = 'EXPIRING';
      expiringSoonCount++;
    } else {
      safeCount++;
    }

    return { ...item, daysLeft, status };
  });

  // Sort by days left (ascending) and only take the ones that are critical/expiring/expired
  const useFirstItems = processedItems
    .filter(item => item.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5); // Show top 5

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Analyzing your pantry...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      
      {/* Header */}
      <div>
        <h1 className="text-sm font-medium text-slate-500 tracking-wider">SMARTPANTRY</h1>
        <h2 className="text-3xl font-bold text-slate-800 mt-1">Good Morning, {capitalizedName}!</h2>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/pantry" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors">
          <span className="text-slate-500 text-sm font-medium text-center">PRODUCTS</span>
          <span className="text-3xl font-bold text-slate-800 mt-1">{totalTypes}</span>
        </Link>
        <Link to="/pantry" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors">
          <span className="text-slate-500 text-sm font-medium text-center">TOTAL ITEMS</span>
          <span className="text-3xl font-bold text-slate-800 mt-1">{totalQuantity}</span>
        </Link>
        <Link to="/pantry?filter=expiring" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center hover:bg-orange-50 transition-colors">
          <span className="text-orange-500 text-sm font-medium text-center">EXPIRING (7 days)</span>
          <span className="text-3xl font-bold text-orange-600 mt-1">{expiringSoonCount + criticalCount}</span>
        </Link>
        <Link to="/pantry?filter=expired" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center hover:bg-red-50 transition-colors">
          <span className="text-red-500 text-sm font-medium text-center">EXPIRED</span>
          <span className="text-3xl font-bold text-red-600 mt-1">{expiredCount}</span>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Link to="/scan" className="flex flex-col items-center justify-center p-4 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors">
          <ScanLine size={32} className="mb-2" />
          <span className="font-medium text-sm text-center">Scan Product</span>
        </Link>
        <Link to="/scan" className="flex flex-col items-center justify-center p-4 bg-white text-blue-600 border border-blue-100 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors">
          <Plus size={32} className="mb-2" />
          <span className="font-medium text-sm text-center">Add Manually</span>
        </Link>
        <Link to="/shopping-list" className="flex flex-col items-center justify-center p-4 bg-white text-blue-600 border border-blue-100 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors">
          <ShoppingCart size={32} className="mb-2" />
          <span className="font-medium text-sm text-center">Shopping List</span>
        </Link>
      </div>

      <hr className="border-slate-200" />

      {/* Critical Alerts Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Critical Alerts</h3>
        
        {expiredCount === 0 && expiringSoonCount === 0 && criticalCount === 0 ? (
          <div className="bg-green-50 text-green-700 p-6 rounded-2xl text-center border border-green-100 font-medium">
            ✅ All clear! You have no items expiring soon.
          </div>
        ) : (
          <div className="space-y-3">
            {useFirstItems.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-4 rounded-xl border-l-4 shadow-sm bg-white ${
                  item.daysLeft < 0 ? 'border-red-500' : 
                  item.daysLeft <= 3 ? 'border-orange-500' : 'border-yellow-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={
                    item.daysLeft < 0 ? 'text-red-500' : 
                    item.daysLeft <= 3 ? 'text-orange-500' : 'text-yellow-500'
                  } size={20} />
                  <div>
                    <h4 className="font-bold text-slate-800">{item.name || 'Unknown Item'}</h4>
                    <p className="text-sm text-slate-500">
                      {item.daysLeft < 0 
                        ? `Expired ${Math.abs(item.daysLeft)} days ago` 
                        : `Expiring in ${item.daysLeft} days`}
                    </p>
                  </div>
                </div>
                <Link to="/pantry" className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
                  View in Pantry
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
