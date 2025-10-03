import React, { useState } from 'react';
import FileInput from '../../components/form/input/FileInput';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import client from '../../services/axiosClient';
import { getLocalItem, LOCAL_STORAGE_KEYS } from '../../Utils/Helpers';
import toast from 'react-hot-toast';
import { Download, Upload, X } from 'lucide-react';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface UploadResult {
  created: number;
  updated: number;
  errors?: string[];
}

interface UploadResponse {
  success: boolean;
  message: string;
  results?: Record<string, UploadResult>;
}

const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      const response = await client.get('/master/excel-template', {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'master-template.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      setExcelFile(null);
      return;
    }

    const file = event.target.files[0];
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid Excel file (.xlsx, .xls)');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setExcelFile(file);
  };

  const handleUploadExcel = async () => {
    if (!excelFile) {
      toast.error('Please select an Excel file to upload');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('excelFile', excelFile);

      const response = await client.post<UploadResponse>(
        '/master/upload-excel', 
        formData, 
        {
          headers: {
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        toast.success('Excel file uploaded successfully');
        setUploadResponse(response.data);
        setShowResults(true);
        setExcelFile(null);
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error uploading Excel file:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload Excel file';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
    onClose();
  };

  const getTotalCounts = () => {
    if (!uploadResponse?.results) return { totalCreated: 0, totalUpdated: 0, totalErrors: 0 };
    
    return Object.values(uploadResponse.results).reduce(
      (acc, item) => ({
        totalCreated: acc.totalCreated + (item?.created || 0),
        totalUpdated: acc.totalUpdated + (item?.updated || 0),
        totalErrors: acc.totalErrors + (item?.errors?.length || 0),
      }),
      { totalCreated: 0, totalUpdated: 0, totalErrors: 0 }
    );
  };

  const { totalCreated, totalUpdated, totalErrors } = getTotalCounts();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {showResults ? 'Upload Results' : 'Upload Master Data'}
          </h2>
          <button
            type="button"
            onClick={showResults ? handleCloseResults : onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!showResults ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Download the Excel template, fill it with your data, and upload it to update master data.
              </p>
              
              <Button
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                variant="outline"
                startIcon={<Download className="h-4 w-4" />}
              >
                {isDownloading ? 'Downloading...' : 'Download Template'}
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <FileInput
                onChange={handleFileChange}
                className="w-full"
              />
              
              {excelFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {excelFile.name} ({(excelFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUploadExcel}
                disabled={isUploading || !excelFile}
                startIcon={<Upload className="h-4 w-4" />}
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-medium">Upload Successful!</h3>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <p className="text-2xl font-bold text-green-600">{totalCreated}</p>
                  <p>Created</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{totalUpdated}</p>
                  <p>Updated</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{totalErrors}</p>
                  <p>Errors</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCloseResults}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExcelUploadModal;