import { AlertTriangle, ExternalLink, FileIcon, X } from 'lucide-react';
import { useState } from 'react';

interface PDFViewerModalProps {
  fileUrl: string;
  fileName: string;
  onClose: () => void;
}

export const PDFViewerModal = ({
  fileUrl,
  fileName,
  onClose,
}: PDFViewerModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    // Force reload by toggling iframe src
    const iframe = document.querySelector('#pdf-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileIcon size={18} className="text-gray-500" />
            <span className="font-medium text-gray-900">{fileName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-100 rounded-b-xl relative">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <AlertTriangle size={48} className="text-red-500" />
              <div className="text-gray-700">{error}</div>
              <button onClick={handleRetry} className="btn btn-primary">
                Retry
              </button>
            </div>
          ) : (
            <iframe
              id="pdf-iframe"
              src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-0"
              title={fileName}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError(
                  'Failed to load PDF. The file may be corrupted or inaccessible.',
                );
              }}
            />
          )}

          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4" />
                <div className="text-gray-500">Loading PDF…</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-between items-center text-xs text-gray-500">
          <div className="flex gap-4">
            <button
              onClick={() => window.open(fileUrl, '_blank')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              <ExternalLink size={12} /> Open in new tab
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              <FileIcon size={12} /> Download
            </button>
          </div>
          <div>Secure document viewer</div>
        </div>
      </div>
    </div>
  );
};
