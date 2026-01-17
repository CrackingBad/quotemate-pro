import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LockKeyhole, User, FileText } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default credentials for 10 users
    const defaultUsers = Array.from({ length: 10 }, (_, i) => ({
      user: `admin${i + 1}`,
      pass: `admin${i + 1}`
    }));

    const storedData = localStorage.getItem("app_users");
    const usersList = storedData ? JSON.parse(storedData) : defaultUsers;

    const validUser = usersList.find((u: any) => u.user === username && u.pass === password);

    if (validUser) {
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("currentUser", username);
      navigate("/");
    } else {
      toast({ title: "Login Failed", description: "Invalid credentials.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <CardHeader className="space-y-2 flex flex-col items-center pb-8">
          <div className="p-3 bg-[#991b1b] rounded-lg mb-2 shadow-md">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-800">QuotePro</CardTitle>
          <CardDescription className="font-medium text-slate-500 text-center">
            Product & Quotation Manager
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input className="pl-10" placeholder="admin1" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input className="pl-10" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-[#991b1b] hover:bg-[#7f1616] text-white py-6 text-lg font-bold">
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
