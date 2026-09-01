import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2 } from 'lucide-react';
import { fetchProductByBarcode } from '../services/productService';

const Scan: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false
    );

    const onScanSuccess = async (decodedText: string) => {
      setScanResult(decodedText);
      setIsScanning(false);
      setIsLookingUp(true);
      scanner.clear();
      
      // Look up the product in the global database!
      const productData = await fetchProductByBarcode(decodedText);
      
      // Navigate to the "Add Product" page with the data we found
      navigate('/add-product', { 
        state: { 
          barcode: decodedText,
          product: productData 
        } 
      });
    };

    const onScanFailure = () => {
      // Ignore routine scan failures
    };

    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup on unmount
    return () => {
      scanner.clear().catch(e => {
        console.error("Failed to clear html5QrcodeScanner. ", e);
      });
    };
  }, [isScanning, navigate]);

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 h-full flex flex-col">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Scan Product</h2>
        <p className="text-slate-500 mt-2">Point your camera at a barcode or QR code.</p>
      </div>

      {isScanning ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             {/* The html5-qrcode library will inject the video stream here */}
            <div id="reader" className="w-full"></div>
          </div>
          <button 
            onClick={() => { /* We'll implement manual entry later */ }}
            className="mt-6 text-blue-600 font-medium hover:underline"
          >
            Enter Barcode Manually
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          {isLookingUp ? (
             <div className="flex flex-col items-center justify-center">
               <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
               <h3 className="text-xl font-bold text-slate-800">Looking up product...</h3>
               <p className="text-slate-600 font-mono bg-slate-100 px-4 py-2 rounded-lg mt-4">
                 Barcode: {scanResult}
               </p>
             </div>
          ) : (
             <>
               <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                 <Check size={40} />
               </div>
               <h3 className="text-xl font-bold text-slate-800">Barcode Detected!</h3>
             </>
          )}
        </div>
      )}
    </div>
  );
};

export default Scan;
