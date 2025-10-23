import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadZoneProps {
  title: string;
  description: string;
  onFileUpload: (file: File) => void;
  uploadedFile: File | null;
  onRemoveFile: () => void;
  isDisabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  title,
  description,
  onFileUpload,
  uploadedFile,
  onRemoveFile,
  isDisabled = false
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast.error('Please upload a valid STL file');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onFileUpload(file);
          toast.success(`${file.name} uploaded successfully`);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/sla': ['.stl'],
      'application/vnd.ms-pki.stl': ['.stl'],
      'model/stl': ['.stl']
    },
    maxFiles: 1,
    disabled: isDisabled || isUploading
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="p-7 h-full bg-gradient-card border-2 shadow-lg hover:shadow-xl transition-shadow">
      <div className="space-y-5 h-full flex flex-col">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {uploadedFile ? (
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(uploadedFile.size)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRemoveFile}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Remove File
              </Button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`
              flex-1 upload-zone rounded-lg p-8 cursor-pointer
              flex flex-col items-center justify-center text-center
              transition-all duration-200
              ${isDragActive ? 'drag-over' : ''}
              ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="space-y-4 w-full max-w-xs">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Uploading...</p>
                  <Progress value={uploadProgress} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {uploadProgress}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {isDragActive ? 'Drop STL file here' : 'Drop STL file here or click to browse'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports STL files up to 100MB
                  </p>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Browse Files
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};