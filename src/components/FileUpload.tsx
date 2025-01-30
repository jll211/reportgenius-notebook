import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
      const file = e.dataTransfer.files[0];
      console.log("File dropped:", file);
      validateAndUploadFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("File selected:", file);
      validateAndUploadFile(file);
    }
  };

  const validateAndUploadFile = async (file: File) => {
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

      // Create a proper object to send to the Edge Function
      const payload = {
        name: file.name,
        type: file.type,
        size: file.size,
        userId: user.id,
        // Convert file to base64
        content: await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        })
      };

      console.log("Calling upload-file function with payload");
      
      const { data, error } = await supabase.functions.invoke('upload-file', {
        body: payload
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      console.log("Upload response:", data);
      onFileSelect(file);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Error uploading file');
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