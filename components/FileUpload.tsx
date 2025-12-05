import React, { useState, useRef } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { FileData } from '../types';
import { MAX_FILE_SIZE_MB } from '../constants';

interface FileUploadProps {
  onFileSelect: (fileData: FileData | null) => void;
  selectedFile: FileData | null;
  disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    
    // Check size
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    // Check type (Basic check, Gemini supports PDF and Text well)
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) { // simplistic .md check
       // Soft fail: we warn but try anyway if it looks like text, but better to restrict for this demo
       if(!file.type.startsWith('text/') && file.type !== 'application/pdf') {
         setError("Unsupported file type. Please upload PDF or Text files.");
         return;
       }
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // result is "data:mime;base64,....."
      // we need to extract the base64 part and the mime
      const base64Content = result.split(',')[1];
      
      onFileSelect({
        name: file.name,
        type: file.type || 'text/plain',
        content: base64Content,
        size: file.size
      });
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && !disabled) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0] && !disabled) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
    setError(null);
  };

  return (
    <div className="w-full">
      <div
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out
          ${dragActive ? 'border-brand-500 bg-brand-50 scale-[1.01]' : 'border-gray-300 bg-white hover:bg-gray-50'}
          ${selectedFile ? 'border-brand-500 bg-brand-50' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={!disabled ? handleDrag : undefined}
        onDragLeave={!disabled ? handleDrag : undefined}
        onDragOver={!disabled ? handleDrag : undefined}
        onDrop={!disabled ? handleDrop : undefined}
        onClick={() => !disabled && !selectedFile && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.txt,.md"
          disabled={disabled}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-3">
              <FileText className="w-8 h-8 text-brand-600" />
            </div>
            <p className="text-sm font-medium text-slate-700">{selectedFile.name}</p>
            <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            {!disabled && (
               <button
               onClick={removeFile}
               className="mt-4 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors flex items-center gap-1"
             >
               <X className="w-3 h-3" /> Remove File
             </button>
            )}
           
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
               <Upload className="w-8 h-8" />
            </div>
            <p className="text-lg font-semibold text-slate-700">Click to upload or drag & drop</p>
            <p className="text-sm text-slate-500 mt-2">PDF or Text files (max {MAX_FILE_SIZE_MB}MB)</p>
            <p className="text-xs text-slate-400 mt-4">We ensure your SOW is clear and complete</p>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-3 flex items-start gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};