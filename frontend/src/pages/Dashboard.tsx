import React from 'react';
import { ScanLine, Plus, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  
  // Get name from email (everything before the @)
  const displayName = currentUser?.email ? currentUser.email.split('@')[0] : 'User';
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  // Mock data for UI design
  const summary = {
    totalTypes: 24,
    totalQuantity: 126,
    safe: 82,
    expiringSoon: 31,
    critical: 8,
    expired: 5
  };

  const expiringItems = [
    { id: '1', name: 'Milk', quantity: 3, unit: 'packets', expiry: '02 SEP', daysLeft: 2, status: 'CRITICAL' },
    { id: '2', name: 'Bread', quantity: 2, unit: 'packets', expiry: '04 SEP', daysLeft: 4, status: 'CRITICAL' },
    { id: '3', name: 'Curd', quantity: 4, unit: 'packets', expiry: '06 SEP', daysLeft: 6, status: 'CRITICAL' },
    { id: '4', name: 'Biscuits', quantity: 5, unit: 'packets', expiry: '10 SEP', daysLeft: 10, status: 'EXPIRING' }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-sm font-medium text-slate-500 tracking-wider">SMARTPANTRY</h1>
        <h2 className="text-3xl font-bold text-slate-800 mt-1">Good Morning, {capitalizedName}!</h2>
      </div>

      {/* Inventory Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <span className="text-slate-500 text-sm font-medium">PRODUCTS</span>
          <span className="text-3xl font-bold text-slate-800 mt-1">{summary.totalTypes}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <span className="text-slate-500 text-sm font-medium">QUANTITY</span>
          <span className="text-3xl font-bold text-slate-800 mt-1">{summary.totalQuantity}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <span className="text-orange-500 text-sm font-medium">EXPIRING</span>
          <span className="text-3xl font-bold text-orange-600 mt-1">{summary.expiringSoon + summary.critical}</span>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <span className="text-red-500 text-sm font-medium">EXPIRED</span>
          <span className="text-3xl font-bold text-red-600 mt-1">{summary.expired}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Link to="/scan" className="flex flex-col items-center justify-center p-4 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors">
          <ScanLine size={32} className="mb-2" />
          <span className="font-medium text-sm text-center">Scan Product</span>
        </Link>
        <button className="flex flex-col items-center justify-center p-4 bg-white text-blue-600 border border-blue-100 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors">
          <Plus size={32} className="mb-2" />
          <span className="font-medium text-sm text-center">Add Product</span>
        </button>
        <button className="flex flex-col items-center justify-center p-4 bg-white text-blue-600 border border-blue-100 rounded-2xl shadow-sm hover:bg-blue-50 transition-colors">
          <ShoppingCart size={32} className="mb-2" />
          <span className="font-medium text-sm text-center">Shopping List</span>
        </button>
      </div>

      <hr className="border-slate-200" />

      {/* Use First Section */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="text-orange-500" size={24} />
          <h3 className="text-xl font-bold text-slate-800">USE FIRST</h3>
        </div>
        
        <div className="space-y-3">
          {expiringItems.map(item => (
            <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-lg">{item.name}</h4>
                <p className="text-slate-500 text-sm">{item.quantity} {item.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-500">EXP: {item.expiry}</p>
                <p className={`font-bold ${item.daysLeft <= 7 ? 'text-red-500' : 'text-orange-500'}`}>
                  {item.daysLeft} DAYS LEFT
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Low Stock Section */}
      <div className="pb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">LOW STOCK</h3>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-lg">Toothpaste</h4>
            <p className="text-red-500 text-sm font-medium">1 remaining</p>
          </div>
          <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
            Add to List
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
