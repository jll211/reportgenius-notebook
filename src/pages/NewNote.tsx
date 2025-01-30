import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { FileUpload } from "@/components/FileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const NewNote = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSave = async () => {
    if (!title) {
      toast.error("Please add a title");
      return;
    }
    
    // TODO: Implement Supabase save functionality
    toast.success("Note saved successfully!");
  };

  const handleFileSelect = (file: File) => {
    // TODO: Implement file processing
    toast.success(`File ${file.name} selected`);
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
          
          <Button onClick={handleSave}>Save Note</Button>
        </div>
      </main>
    </div>
  );
};

export default NewNote;