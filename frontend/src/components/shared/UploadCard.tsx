import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, FileText } from 'lucide-react';
import { PillButton } from './PillButton';

export interface UploadCardProps {
  label?: string;
  hint?: string;
  accept?: string;
  onFileSelect?: (file: File) => void;
  onFileSelected?: (file?: File) => void;
  fileName?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  label = 'Upload document or receipt',
  hint = 'PDF, PNG, JPG up to 10MB',
  accept = 'image/*,.pdf',
  onFileSelect,
  onFileSelected,
  fileName,
  className = '',
  style,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedName, setSelectedName] = useState<string | null>(fileName || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedName(file.name);
      onFileSelect?.(file);
      onFileSelected?.(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedName(file.name);
      onFileSelect?.(file);
      onFileSelected?.(file);
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative p-5 rounded-[24px] border-2 border-dashed transition-all cursor-pointer select-none flex flex-col items-center justify-center text-center gap-2 ${
        isDragging
          ? 'border-[#163832] bg-[#DAF1DE]/40'
          : 'border-[#DAF1DE] bg-[#FFFFFF] hover:border-[#8EB69B]'
      } ${className}`}
      style={{
        boxShadow: '0 4px 14px rgba(5,31,32,0.03)',
        ...style,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-[#163832] mb-1"
        style={{
          backgroundColor: selectedName ? '#DAF1DE' : '#F6FBF7',
          border: '1px solid #8EB69B',
        }}
      >
        {selectedName ? (
          <CheckCircle2 size={22} className="text-[#163832]" />
        ) : (
          <UploadCloud size={22} />
        )}
      </div>

      <div className="font-bold text-sm text-[#051F20]">
        {selectedName || label}
      </div>

      <div className="text-xs text-[#235347] font-medium">
        {selectedName ? 'Click to replace file' : hint}
      </div>

      <div className="mt-1">
        <PillButton
          variant="secondary"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {selectedName ? 'Change File' : 'Browse Files'}
        </PillButton>
      </div>
    </div>
  );
};

export default UploadCard;
