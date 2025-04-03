"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { baseURL } from "./utlils/const";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInfo, setloginInfo] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });

  const router = useRouter();

  // Check authentication status on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setloginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange1 = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;
    if (!email || !password) {
      return toast.error("Email and Password are required!");
    }

    try {
      const response = await fetch(`${baseURL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginInfo),
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem("token", result.jwtToken);
        localStorage.setItem("loggedInUser", result.name);
        setIsAuthenticated(true);
        toast.success(result.message);
        router.replace("/");  // Redirect immediately
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSubmit1 = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupData;
    if (!name || !email || !password) {
      return toast.error("Name, Email, and Password are required!");
    }
    localStorage.setItem("Password", password);
    try {
      const response = await fetch(`${baseURL}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userData", JSON.stringify(data.userData));
        toast.success(data.message);
        router.push("/verify");
      } else {
        toast.error(data.error || "Signup failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("No token found. Cannot logout.");

      const decodedToken = jwtDecode(token);
      const userEmail = decodedToken.email;
      if (!userEmail) return toast.error("User ID not found in token.");

      const response = await fetch(`${baseURL}/api/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });

      const result = await response.json();
      if (result.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("loggedInUser");
        setIsAuthenticated(false);
        toast.success(result.message);
        router.replace("/");  // Redirect immediately
      } else {
        toast.error(result.error || "Logout failed");
      }
    } catch (error) {
      toast.error("Something went wrong while logging out.");
    }
  };

  return (
    <div className="text-white py-4">
      <header className="container mx-auto flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold tracking-wide text-blue-400">persona.ai</h1>
         </div> 
         <div>
          {isAuthenticated ? (
            <Button onClick={handleLogout}>Logout</Button>
          ) : (
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="mine">Sign Up to Chat</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Signup</DialogTitle>
                    <DialogDescription>
                      Create an account to start chatting with intelligent AI characters!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Label className="text-right">Username:</Label>
                    <Input
                      name="name"
                      placeholder="Enter your name"
                      type="text"
                      value={signupData.name}
                      onChange={handleChange1}
                      required
                    />
                    <Label className="text-right">Email:</Label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={signupData.email}
                      onChange={handleChange1}
                      required
                    />
                    <Label className="text-right">Password:</Label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={signupData.password}
                      onChange={handleChange1}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleSubmit1}>Continue</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button>Login</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Login</DialogTitle>
                    <DialogDescription>Log in to access your account securely.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Label className="text-right">Email:</Label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email"
                      value={loginInfo.email}
                      onChange={handleChange}
                      required
                    />
                    <Label className="text-right">Password:</Label>
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={loginInfo.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>Continue</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
