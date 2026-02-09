import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import NavBar from '@/components/NavBar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function UploadPage({ user }) {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
    } else {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data);
        toast.success('Data uploaded and ingested successfully!');
      } else {
        toast.error(data.detail || 'Upload failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar user={user} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-2">
            Upload Data
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Upload your Excel file containing production, energy, maintenance, quality, sales, and finance data.
          </p>
        </div>

        {/* Upload Area */}
        <div
          data-testid="upload-dropzone"
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            data-testid="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-4">
            {file ? (
              <FileSpreadsheet className="w-16 h-16 text-primary" />
            ) : (
              <Upload className="w-16 h-16 text-muted-foreground" />
            )}
            
            {file ? (
              <div className="text-center">
                <p className="text-lg font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg font-medium text-foreground mb-2">
                  Drop your Excel file here or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports .xlsx and .xls files (max 50MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {file && (
          <div className="mt-6 flex gap-4">
            <Button
              data-testid="upload-button"
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload & Process'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setFile(null)}
              disabled={uploading}
            >
              Clear
            </Button>
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div className="mt-8 kpi-card" data-testid="upload-result">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-6 h-6 text-success" />
              <h3 className="text-xl font-heading font-semibold">
                {uploadResult.message}
              </h3>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {uploadResult.stats && uploadResult.stats.plants && (
                <div>
                  <p className="kpi-label mb-1">Plants</p>
                  <p className="text-2xl font-mono font-medium">
                    {uploadResult.stats.plants.length}
                  </p>
                </div>
              )}
              {uploadResult.stats && uploadResult.stats.rowsPerSheet && (
                Object.entries(uploadResult.stats.rowsPerSheet).map(([sheet, count]) => (
                  <div key={sheet}>
                    <p className="kpi-label mb-1">{sheet}</p>
                    <p className="text-2xl font-mono font-medium">{count}</p>
                  </div>
                ))
              )}
            </div>

            {/* Preview */}
            {uploadResult.preview && Object.keys(uploadResult.preview).length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Data Preview</h4>
                <div className="bg-muted rounded-sm p-4 max-h-60 overflow-auto">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(uploadResult.preview, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Navigate to Dashboard */}
            <Button
              data-testid="view-dashboard-button"
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full"
            >
              View Dashboards <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 kpi-card">
          <h3 className="text-lg font-heading font-semibold mb-4">Expected Data Format</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Your Excel file should contain the following sheets:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Production:</strong> Date, Plant, Line, Cement_MT, Clinker_MT, Capacity_Util_%, Downtime_Hrs</li>
              <li><strong>Energy:</strong> Date, Plant, Power_kWh_Ton, Heat_kcal_kg, Fuel_Cost_Rs_Ton, AFR_%</li>
              <li><strong>Maintenance:</strong> Date, Plant, Equipment, Breakdown_Hrs, MTBF_Hrs, MTTR_Hrs</li>
              <li><strong>Quality:</strong> Date, Plant, Blaine, Strength_28D, Clinker_Factor</li>
              <li><strong>Sales_Logistics:</strong> Date, Plant, Region, Dispatch_MT, Realization_Rs_Ton, Freight_Rs_Ton, OTIF_%</li>
              <li><strong>Finance:</strong> Date, Plant, Cost_Rs_Ton, EBITDA_Rs_Ton, Margin_%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
