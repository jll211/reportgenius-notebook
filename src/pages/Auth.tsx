import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log("Starting authentication process...");
      
      if (isSignUp) {
        console.log("Attempting to sign up...");
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) {
          console.error("Sign up error:", signUpError);
          if (signUpError.message.includes("email_provider_disabled")) {
            throw new Error("Email sign up is currently disabled. Please enable it in your Supabase settings.");
          }
          throw signUpError;
        }
        
        console.log("Sign up successful:", signUpData);
        toast.success("Account created successfully!");
        
        // Since email verification is disabled, proceed to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.error("Auto sign in error:", signInError);
          if (signInError.message.includes("email_provider_disabled")) {
            throw new Error("Email login is currently disabled. Please enable it in your Supabase settings.");
          }
          throw signInError;
        }
        
        console.log("Auto sign in after signup successful:", signInData);
        navigate("/");
      } else {
        console.log("Attempting to sign in...");
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Sign in error:", error);
          if (error.message.includes("email_provider_disabled")) {
            throw new Error("Email login is currently disabled. Please enable it in your Supabase settings.");
          }
          throw error;
        }
        
        console.log("Sign in successful:", data);
        toast.success("Signed in successfully!");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {isSignUp
              ? "Enter your details to create a new account"
              : "Enter your credentials to access your account"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            className="text-sm"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;