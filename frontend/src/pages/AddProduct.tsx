import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Check } from 'lucide-react';
import type { ProductInfo } from '../services/productService';

import { useAuth } from '../contexts/AuthContext';
import { addToPantry } from '../services/dbService';

const AddProduct: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const barcode = location.state?.barcode || '';
  const initialProduct = location.state?.product as ProductInfo | null;

  const [name, setName] = useState(initialProduct?.name || '');
  const [brand, setBrand] = useState(initialProduct?.brand || '');
  const [category, setCategory] = useState(initialProduct?.category || '');
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    
    try {
      await addToPantry({
        userId: currentUser.uid,
        barcode: barcode || 'manual-entry',
        name,
        brand,
        category,
        image: initialProduct?.image || '',
        quantityPurchased: quantity,
        quantityRemaining: quantity,
        expiryDate: expiryDate,
        purchaseDate: new Date().toISOString().split('T')[0]
      });
      
      // Successfully saved!
      navigate('/pantry');
    } catch (error) {
      alert("Failed to save product");
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">Add to Pantry</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:space-x-6">
          
          {/* Product Image */}
          <div className="flex-shrink-0 mb-6 md:mb-0 flex flex-col items-center">
            <div className="w-40 h-40 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden border border-slate-200">
              {initialProduct?.image ? (
                <img src={initialProduct.image} alt="Product" className="w-full h-full object-cover" />
              ) : (
                <Camera size={48} className="text-slate-400" />
              )}
            </div>
          </div>

          {/* Product Details Form */}
          <div className="flex-1 space-y-4">
            
            {initialProduct ? (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                <Check size={20} className="text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-green-800">Product Found!</h4>
                  <p className="text-sm text-green-700 mt-1">We found this product in the global database using the barcode <strong>{barcode}</strong>.</p>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-sm text-orange-800">Product not found in the global database. You can enter the details manually below.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                <input 
                  type="text" 
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <hr className="border-slate-200 my-4" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full mt-6 py-3 text-white rounded-xl font-bold transition-colors ${
                isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? 'Saving to Database...' : 'Add to Pantry'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
