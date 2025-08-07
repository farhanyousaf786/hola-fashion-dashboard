import React, { useState } from 'react';
import { bulkUploadSampleItems } from '../utils/bulkUploadItems';

const BulkUploadButton = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleBulkUpload = async () => {
    if (isUploading) return;
    
    setIsUploading(true);
    setUploadResult(null);
    
    try {
      const result = await bulkUploadSampleItems();
      setUploadResult(result);
    } catch (error) {
      setUploadResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 9999,
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: '2px solid #E94949'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#E94949' }}>🚀 Bulk Upload Tool</h3>
      
      <button
        onClick={handleBulkUpload}
        disabled={isUploading}
        style={{
          backgroundColor: isUploading ? '#ccc' : '#E94949',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '6px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          width: '100%',
          marginBottom: '10px'
        }}
      >
        {isUploading ? '⏳ Uploading...' : '📤 Upload Sample Items'}
      </button>
      
      <p style={{ 
        margin: '0', 
        fontSize: '12px', 
        color: '#666',
        textAlign: 'center'
      }}>
        Uploads 16 sample items across all categories
      </p>
      
      {uploadResult && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          borderRadius: '4px',
          backgroundColor: uploadResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${uploadResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          color: uploadResult.success ? '#155724' : '#721c24'
        }}>
          {uploadResult.success ? (
            <div>
              <strong>✅ Upload Complete!</strong>
              <br />
              Successfully uploaded: {uploadResult.successful}/{uploadResult.total} items
              {uploadResult.failed > 0 && (
                <><br />Failed: {uploadResult.failed} items</>
              )}
            </div>
          ) : (
            <div>
              <strong>❌ Upload Failed</strong>
              <br />
              {uploadResult.error}
            </div>
          )}
        </div>
      )}
      
      <div style={{ 
        marginTop: '10px', 
        fontSize: '10px', 
        color: '#999',
        textAlign: 'center'
      }}>
        Remove this component after testing!
      </div>
    </div>
  );
};

export default BulkUploadButton;
