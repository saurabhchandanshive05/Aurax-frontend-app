import React, { useState, useRef } from 'react';
import axios from 'axios';
import './CreatorImportModal.css';

const CreatorImportModal = ({ isOpen, onClose, onImportSuccess }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Invalid file format. Please upload an Excel or CSV file.');
        return;
      }

      // Validate file size (10MB max)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size exceeds 10MB limit.');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    try {
      setIsImporting(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/admin/import/creators`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setImportResult(response.data);
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Import failed. Please try again.');
      console.error('Import error:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="import-modal-overlay" onClick={handleClose}>
      <div className="import-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="import-modal-header">
          <h2>📥 Import Creators from Excel</h2>
          <button className="import-modal-close" onClick={handleClose}>✕</button>
        </div>

        {!importResult ? (
          <div className="import-modal-body">
            <div className="import-instructions">
              <h3>Instructions:</h3>
              <ul>
                <li>Select an Excel (.xlsx, .xls) or CSV file with creator data</li>
                <li>Required columns: Creator Name, Instagram Handle, Business Email</li>
                <li>Optional columns: Followers, Location, Bio, Pricing, Management Info, etc.</li>
                <li>Duplicate records (same email/Instagram) will be skipped</li>
                <li>Maximum file size: 10MB</li>
              </ul>
            </div>

            <div className="import-file-section">
              <div
                className="import-file-input-wrapper"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <div className="import-file-drop-zone">
                  <span className="import-file-icon">📄</span>
                  <p>{file?.name || 'Click to select file or drag & drop'}</p>
                </div>
              </div>

              {file && (
                <div className="import-file-info">
                  <p>📎 Selected: <strong>{file.name}</strong></p>
                  <p>📊 Size: <strong>{(file.size / 1024).toFixed(1)} KB</strong></p>
                </div>
              )}
            </div>

            {error && (
              <div className="import-error-message">
                ❌ {error}
              </div>
            )}

            <div className="import-modal-actions">
              <button
                className="import-btn-cancel"
                onClick={handleClose}
                disabled={isImporting}
              >
                Cancel
              </button>
              <button
                className="import-btn-submit"
                onClick={handleImport}
                disabled={!file || isImporting}
              >
                {isImporting ? '⏳ Importing...' : '✅ Import Creators'}
              </button>
            </div>
          </div>
        ) : (
          <div className="import-modal-results">
            <div className="import-summary">
              <h3>✅ Import Complete!</h3>
              <div className="import-stats-grid">
                <div className="import-stat-card success">
                  <div className="import-stat-number">
                    {importResult.summary.successful}
                  </div>
                  <div className="import-stat-label">Successfully Imported</div>
                </div>
                <div className="import-stat-card warning">
                  <div className="import-stat-number">
                    {importResult.summary.duplicates}
                  </div>
                  <div className="import-stat-label">Duplicates Skipped</div>
                </div>
                <div className="import-stat-card error">
                  <div className="import-stat-number">
                    {importResult.summary.failed}
                  </div>
                  <div className="import-stat-label">Failed</div>
                </div>
                <div className="import-stat-card info">
                  <div className="import-stat-number">
                    {importResult.summary.totalRows}
                  </div>
                  <div className="import-stat-label">Total Rows</div>
                </div>
              </div>
            </div>

            {importResult.data.errors.length > 0 && (
              <div className="import-error-details">
                <h4>❌ Failed Records ({importResult.data.errors.length})</h4>
                <div className="import-error-list">
                  {importResult.data.errors.slice(0, 5).map((error, idx) => (
                    <div key={idx} className="import-error-item">
                      <span className="import-error-row">Row {error.row}</span>
                      <span className="import-error-name">{error.name}</span>
                      <span className="import-error-msg">{error.error}</span>
                    </div>
                  ))}
                  {importResult.data.errors.length > 5 && (
                    <p className="import-error-more">
                      ... and {importResult.data.errors.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {importResult.data.duplicates.length > 0 && (
              <div className="import-duplicates-details">
                <h4>⚠️ Duplicate Records ({importResult.data.duplicates.length})</h4>
                <div className="import-duplicates-list">
                  {importResult.data.duplicates.slice(0, 5).map((dup, idx) => (
                    <div key={idx} className="import-duplicate-item">
                      <span className="import-dup-row">Row {dup.row}</span>
                      <span className="import-dup-info">{dup.name}</span>
                    </div>
                  ))}
                  {importResult.data.duplicates.length > 5 && (
                    <p className="import-dup-more">
                      ... and {importResult.data.duplicates.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="import-modal-actions">
              <button
                className="import-btn-close"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorImportModal;
