import { ArrowLeft, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface PdfViewerProps {
  url: string;
  title: string;
  onVolver: () => void;
}

export function PdfViewer({ url, title, onVolver }: PdfViewerProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onVolver}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#04a25c' }}>
                {title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Visualización de documento
              </p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar
          </button>
        </div>
      </Card>

      {/* PDF Viewer */}
      <Card className="p-6">
        <div className="w-full h-[calc(100vh-250px)]">
          <iframe
            src={url}
            className="w-full h-full rounded-md border border-gray-200"
            title={title}
          />
        </div>
      </Card>
    </div>
  );
}
