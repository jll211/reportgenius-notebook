import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        dragActive ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        Drag and drop your files here, or
      </p>
      <label htmlFor="file-upload" className="mt-2 cursor-pointer">
        <Button variant="outline" className="relative">
          Browse Files
          <input
            id="file-upload"
            type="file"
            className="sr-only"
            onChange={handleChange}
            accept=".json,.txt,.rtf,.pdf,.m4a,.docx,.xls,.csv,.xlsx,.png,.jpg,.jpeg,.html"
          />
        </Button>
      </label>
    </div>
  );
};