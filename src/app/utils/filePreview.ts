import { apiClient } from '../api/client';

const extractGuidFromValue = (value: string): string => {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';
  if (/^[0-9a-fA-F-]{32,}$/.test(trimmed) && trimmed.includes('-')) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed, window.location.origin);
    const guid = parsed.searchParams.get('guid');
    return guid ? guid.trim() : '';
  } catch {
    return '';
  }
};

export const fetchProtectedFileBlob = async (value: string): Promise<Blob | null> => {
  const guid = extractGuidFromValue(value);
  if (!guid) return null;
  try {
    const response = await apiClient.get('/hv_ref_archivo/file', {
      params: { guid },
      responseType: 'blob',
    });
    return response.data as Blob;
  } catch {
    return null;
  }
};

export const previewProtectedFile = async (value: string) => {
  if (!value) return;
  const blob = await fetchProtectedFileBlob(value);
  if (blob) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return;
  }
  window.open(value, '_blank', 'noopener,noreferrer');
};

export const downloadProtectedFile = async (value: string, filename?: string) => {
  if (!value) return;
  const blob = await fetchProtectedFileBlob(value);
  if (blob) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    if (filename) {
      link.download = filename;
    }
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const link = document.createElement('a');
  link.href = value;
  if (filename) {
    link.download = filename;
  }
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
};
