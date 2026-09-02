import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { fetchProductByBarcode } from '../services/productService';
import type { ProductInfo } from '../services/productService';
import { addToPantry } from '../services/dbService';
import { useAuth } from '../contexts/AuthContext';
import { Check, Loader2, Package, Plus, Minus, X } from 'lucide-react';

const Scan: React.FC = () => {
  const { currentUser } = useAuth();
  
  const [isScanning, setIsScanning] = useState(true);
  const [lookupState, setLookupState] = useState<'idle' | 'loading' | 'success' | 'not-found'>('idle');
  
  // Scanned data
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState<ProductInfo | null>(null);
  
  // Form state for the popup
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Default 1 month
  const [manualName, setManualName] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 150 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false
    );

    const onScanSuccess = async (decodedText: string) => {
      // Beep sound (simulated checkout)
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
        audio.play().catch(() => {}); // ignore autoplay restrictions
      } catch (e) {}

      scanner.clear();
      setIsScanning(false);
      setBarcode(decodedText);
      setLookupState('loading');
      
      const productData = await fetchProductByBarcode(decodedText);
      
      if (productData) {
        setProduct(productData);
        setLookupState('success');
      } else {
        setProduct(null);
        setLookupState('not-found');
      }
    };

    scanner.render(onScanSuccess, () => {});

    return () => {
      try { scanner.clear(); } catch(e) {}
    };
  }, [isScanning]);

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    
    const finalName = product ? product.name : manualName;
    if (!finalName.trim()) {
      alert("Please enter a product name.");
      setIsSaving(false);
      return;
    }

    try {
      await addToPantry({
        userId: currentUser.uid,
        barcode: barcode,
        name: finalName,
        brand: product?.brand || 'Unknown',
        category: product?.category || 'General',
        image: product?.image || '',
        quantityPurchased: quantity,
        quantityRemaining: quantity,
        expiryDate: expiryDate,
        purchaseDate: new Date().toISOString().split('T')[0]
      });
      
      // Reset and go back to scanning
      setIsSaving(false);
      setLookupState('idle');
      setBarcode('');
      setProduct(null);
      setQuantity(1);
      setManualName('');
      setIsScanning(true);
      
      // Show a quick native toast/alert
      alert("✅ Added to Pantry!");
      
    } catch (error) {
      alert("Failed to save product. Please try again.");
      setIsSaving(false);
    }
  };

  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExpiryDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="p-4 max-w-md mx-auto h-full flex flex-col pb-24">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Supermarket Scanner</h2>
        <p className="text-slate-500 text-sm">Scan items to instantly add them to your pantry.</p>
      </div>

      {isScanning ? (
        <div className="flex-1 flex flex-col gap-4 relative">
          <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl flex-1 relative flex flex-col">
            <div id="reader" className="w-full flex-1 bg-black"></div>
            <div className="absolute bottom-0 w-full bg-black/70 backdrop-blur-md text-white p-4 text-center text-sm font-medium">
              Align barcode within the frame to auto-add
            </div>
          </div>
          
          <button 
            onClick={() => {
              setIsScanning(false);
              setLookupState('not-found');
              setBarcode('MANUAL_ENTRY');
            }}
            className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Plus size={20} />
            No Barcode? Enter Manually
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Checkout Item</h3>
            <button 
              onClick={() => {
                setLookupState('idle');
                setIsScanning(true);
              }}
              className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            
            {lookupState === 'loading' && (
               <div className="flex flex-col items-center justify-center py-12">
                 <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
                 <p className="font-medium text-slate-600">Identifying product...</p>
                 <p className="text-sm text-slate-400 mt-2 font-mono">{barcode}</p>
               </div>
            )}

            {(lookupState === 'success' || lookupState === 'not-found') && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                
                {/* Product Info / Input */}
                <div className="flex gap-4 items-start">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
                    {product?.image ? (
                      <img src={product.image} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={32} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    {lookupState === 'success' ? (
                      <>
                        <h4 className="font-bold text-xl text-slate-800 leading-tight">{product?.name}</h4>
                        <p className="text-sm text-slate-500 mt-1">{product?.brand}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-md flex items-center gap-1 w-max">
                          <Check size={12} /> Product Found
                        </span>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-md">
                          New Product
                        </span>
                        <input 
                          type="text"
                          placeholder="What is this item?"
                          value={manualName}
                          onChange={e => setManualName(e.target.value)}
                          className="w-full p-2 border-b-2 border-blue-500 bg-slate-50 outline-none text-lg font-bold text-slate-800 placeholder-slate-400"
                          autoFocus
                        />
                      </div>
                    )}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">How many?</label>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-3xl font-bold text-slate-800 w-12 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Expiry Date</label>
                  <input 
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                  />
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button onClick={() => addDays(7)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg whitespace-nowrap hover:bg-slate-200">
                      +1 Week
                    </button>
                    <button onClick={() => addDays(30)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg whitespace-nowrap hover:bg-slate-200">
                      +1 Month
                    </button>
                    <button onClick={() => addDays(180)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg whitespace-nowrap hover:bg-slate-200">
                      +6 Months
                    </button>
                    <button onClick={() => addDays(365)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg whitespace-nowrap hover:bg-slate-200">
                      +1 Year
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`w-full py-4 text-white font-bold rounded-2xl text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                    isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                  }`}
                >
                  {isSaving ? (
                    <><Loader2 size={24} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Check size={24} /> Add to Pantry</>
                  )}
                </button>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scan;
