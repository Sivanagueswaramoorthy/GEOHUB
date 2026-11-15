import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, FileCode, Check } from 'lucide-react';
import { botanicalTheme } from '../theme';

export const BackupExportPanel: React.FC = () => {
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  const handleExport = (format: string) => {
    setDownloadingFormat(format);
    setTimeout(() => {
      // Create mockup download link
      const blob = new Blob([`GeoHub Executive SuperAdmin Dossier - Format: ${format}\nDate: ${new Date().toISOString()}\nDatabase: TiDB Cloud (Port 3306)\nAuthority: SA01`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geohub_executive_dossier_${Date.now()}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadingFormat(null);
    }, 600);
  };

  return (
    <section
      aria-label="Backup and Reports Export"
      className="p-4 sm:p-5 rounded-2xl bg-white border border-[#DAF1DE] shadow-sm flex flex-col gap-3 select-none"
    >
      <div className="flex items-center gap-2.5 pb-2 border-b border-[#DAF1DE]">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: botanicalTheme.colors.paleMint,
            color: botanicalTheme.colors.emeraldSlate,
            borderColor: botanicalTheme.colors.softSage,
          }}
        >
          <Download size={20} strokeWidth={2.2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-[#051F20]">
            System Backup & Dossier Export
          </h2>
          <p className="text-xs text-[#235347] mt-0.5">
            Generate cryptographically signed compliance reports and database snapshots
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => handleExport('PDF')}
          disabled={Boolean(downloadingFormat)}
          className="p-3 rounded-xl bg-[#F6FBF7] hover:bg-[#DAF1DE] border border-[#DAF1DE] flex items-center justify-between transition cursor-pointer text-xs font-bold text-[#051F20] touch-target-44 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-rose-600" />
            <span>PDF Dossier</span>
          </div>
          {downloadingFormat === 'PDF' ? (
            <span className="text-[11px] text-[#235347]">Exporting...</span>
          ) : (
            <Download size={14} className="text-[#8EB69B]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleExport('XLSX')}
          disabled={Boolean(downloadingFormat)}
          className="p-3 rounded-xl bg-[#F6FBF7] hover:bg-[#DAF1DE] border border-[#DAF1DE] flex items-center justify-between transition cursor-pointer text-xs font-bold text-[#051F20] touch-target-44 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <span>Excel Spreadsheets</span>
          </div>
          {downloadingFormat === 'XLSX' ? (
            <span className="text-[11px] text-[#235347]">Exporting...</span>
          ) : (
            <Download size={14} className="text-[#8EB69B]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleExport('DOCX')}
          disabled={Boolean(downloadingFormat)}
          className="p-3 rounded-xl bg-[#F6FBF7] hover:bg-[#DAF1DE] border border-[#DAF1DE] flex items-center justify-between transition cursor-pointer text-xs font-bold text-[#051F20] touch-target-44 shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <FileCode size={16} className="text-blue-600" />
            <span>Word Document</span>
          </div>
          {downloadingFormat === 'DOCX' ? (
            <span className="text-[11px] text-[#235347]">Exporting...</span>
          ) : (
            <Download size={14} className="text-[#8EB69B]" />
          )}
        </button>
      </div>
    </section>
  );
};

export default BackupExportPanel;
