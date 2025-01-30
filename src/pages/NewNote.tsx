import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const NewNote = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!title) {
      toast.error("Please add a title");
      return;
    }

    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to save notes");
        return;
      }

      const { data, error } = await supabase
        .from('ideas')
        .insert({
          title,
          content,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Note saved successfully!");
      navigate("/");
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    console.log("Starting file upload process");
    setIsUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to upload files");
        return;
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      console.log("Uploading file:", fileName);

      // First, ensure the file is less than 50MB
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 50MB");
      }
      
      const { data, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(`${user.id}/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // After successful upload, create a record in the attachments table
      const { error: dbError } = await supabase
        .from('attachments')
        .insert({
          file_name: fileName,
          file_type: file.type,
          file_size: file.size,
          file_path: `${user.id}/${fileName}`,
          metadata: {
            originalName: file.name,
            uploadedBy: user.id,
            uploadedAt: new Date().toISOString()
          }
        });

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      console.log("File uploaded successfully:", data);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <Input
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold"
            />
          </div>
          
          <div>
            <Editor content={content} onChange={setContent} />
          </div>
          
          <div>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleSave} 
              disabled={isLoading || isUploading}
            >
              {isLoading ? "Saving..." : "Save Note"}
            </Button>
            {isUploading && (
              <span className="text-sm text-muted-foreground">
                Uploading file...
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default NewNote;