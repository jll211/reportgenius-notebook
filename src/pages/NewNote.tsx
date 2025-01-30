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

      const { error } = await supabase
        .from('ideas')
        .insert({
          title,
          content,
          user_id: user.id
        });

      if (error) throw error;

      toast.success("Note saved successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to upload files");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast.success(`File ${file.name} uploaded successfully`);
    } catch (error: any) {
      toast.error(`Error uploading file: ${error.message}`);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold"
            />
          </div>
          
          <div className="mb-6">
            <Editor content={content} onChange={setContent} />
          </div>
          
          <div className="mb-6">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
          
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NewNote;