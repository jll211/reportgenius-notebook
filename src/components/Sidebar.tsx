import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, Settings, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  
  return (
    <div className="h-screen w-64 border-r bg-background p-4 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">IdeaBase</h1>
      </div>
      
      <Button asChild variant="outline" className="mb-6 w-full justify-start">
        <Link to="/new">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Note
        </Link>
      </Button>
      
      <nav className="space-y-2 flex-1">
        <Button
          asChild
          variant={location.pathname === "/" ? "secondary" : "ghost"}
          className="w-full justify-start"
        >
          <Link to="/">
            <FileText className="mr-2 h-4 w-4" />
            All Notes
          </Link>
        </Button>
      </nav>
      
      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
        
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start"
        >
          <Link to="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </div>
    </div>
  );
};