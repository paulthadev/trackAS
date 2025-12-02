

import { QRCodeSVG } from "qrcode.react";

const QRCodeModal = ({ qrData, onClose }) => {
  const isBase64Image = qrData?.startsWith('data:image');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Class QR Code
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex justify-center mb-4">
          {isBase64Image ? (
            <img 
              src={qrData} 
              alt="QR Code" 
              className="w-64 h-64"
            />
          ) : (
            <QRCodeSVG 
              value={qrData} 
              size={256}
            />
          )}
        </div>

        <div className="text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

 export default QRCodeModal;