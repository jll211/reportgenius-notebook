import { useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  ideaId?: string;
}

export const FileUpload = ({ onFileSelect, ideaId }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndUploadFile = useCallback(async (file: File) => {
    const allowedTypes = [
      "application/json",
      "text/plain",
      "text/rtf",
      "application/pdf",
      "audio/mp4",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/png",
      "image/jpeg",
      "text/html"
    ];

    console.log("Validating file:", file.type);

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a supported file format.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to upload files");
        return;
      }

      if (!ideaId) {
        toast.error("No idea selected for attachment");
        return;
      }

      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64Content = reader.result as string;
        
        const payload = {
          name: file.name,
          type: file.type,
          size: file.size,
          userId: user.id,
          ideaId: ideaId,
          content: base64Content
        };

        console.log("Calling upload-file function with ideaId:", ideaId);
        
        const { data, error } = await supabase.functions.invoke('upload-file', {
          body: payload
        });

        if (error) {
          console.error("Function error:", error);
          toast.error("Failed to upload file");
          return;
        }

        console.log("Upload response:", data);
        onFileSelect(file);
        toast.success("File uploaded successfully");
      };

      reader.onerror = () => {
        console.error('Error reading file');
        toast.error('Error reading file');
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Error uploading file');
    }
  }, [ideaId, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUploadFile(e.dataTransfer.files[0]);
    }
  }, [validateAndUploadFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      validateAndUploadFile(e.target.files[0]);
    }
  }, [validateAndUploadFile]);

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
        <Button variant="outline" type="button">
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