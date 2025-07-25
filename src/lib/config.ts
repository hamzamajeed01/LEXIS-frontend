export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  maxFilesPerUpload: Number(process.env.NEXT_PUBLIC_MAX_FILES_PER_UPLOAD || '40'),
  maxFileSizeMB: Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '32'),
} as const;

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}; 