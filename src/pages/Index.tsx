import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">My Notes</h1>
            <Button asChild>
              <Link to="/new">
                <Plus className="mr-2 h-4 w-4" />
                New Note
              </Link>
            </Button>
          </div>
          
          <div className="grid gap-4">
            <div className="p-4 border rounded-lg hover:border-primary transition-colors">
              <div className="flex items-start gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Welcome to IdeaBase</h2>
                  <p className="text-muted-foreground">
                    Start organizing your ideas by creating a new note or uploading files.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;