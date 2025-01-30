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

      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);

      console.log("Calling upload-file function");

      const { data, error } = await supabase.functions.invoke('upload-file', {
        body: formData,
      });

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      console.log("Upload response:", data);
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