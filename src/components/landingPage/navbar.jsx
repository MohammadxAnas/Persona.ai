"use client";
import React from "react";
import { Button } from "../ui/button";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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


const NavBar = () => {

    const [loginInfo, setloginInfo] = useState({ email: "", password: "" });
    const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
   
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
  
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  
  
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setloginInfo((prev) => ({ ...prev, [name]: value }));
      };
    
      const handleChange1 = (e) => {
        const { name, value } = e.target;
        setSignupData((prev) => ({ ...prev, [name]: value }));
      };
    
    
    
      const handleLogin = async (e) => {
        setIsDisabled(true);
        e.preventDefault();
        toast("Logging in...");
        console.log("baseURL:",baseURL);
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
            setIsLoginModalOpen(false);
            localStorage.setItem("token", result.jwtToken);
            localStorage.setItem("loggedInUser", result.name);
            localStorage.setItem("UserEmail", result.email);
          
           
            toast.success(result.message);
            router.replace("/dashboard");  // Redirect immediately
    
          } else {
            toast.error(result.message || result.error || "Login failed");
          }
        } catch (err) {
          toast.error("Something went wrong. Please try again.");
        }finally{
          setIsDisabled(false);
        }
      };
    
      const handleSignup = async (e) => {
        setIsDisabled(true);
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
            localStorage.setItem("userData", JSON.stringify(data.userData));
            localStorage.setItem("userEmail",email);
            toast.success(data.message);
            router.push("/verify");
          } else {
            toast.error(data.error || "Signup failed");
          }
        } catch (err) {
          toast.error("Something went wrong. Please try again.");
        }finally{
          setIsDisabled(false);
        }
      };

  return (
    <div className="fixed w-full md:px-20 px-4 py-4">
      <div className="h-14 w-full flex items-center justify-between border border-blue-800 rounded-2xl px-4 bg-gradient-to-r from-blue-700 to-indigo-800 bg-opacity-60 backdrop-blur-md shadow-md">

        <div className="flex gap-3 items-center">
          <p className="text-xl font-mono font-bold text-white tracking-wide">
            persona.ai
          </p>
        </div>

        <div className="flex gap-3 items-center">

        <Dialog>
              <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold px-5 py-2 rounded-xl shadow hover:brightness-110 transition duration-200">
                    Sign Up to Chat
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl shadow-lg border-none">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-indigo-700">Signup</DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    Create an account to start chatting with intelligent AI characters!
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label className="text-gray-700">Username:</Label>
                  <Input
                    name="name"
                    placeholder="Enter your name"
                    value={signupData.name}
                    onChange={handleChange1}
                    required
                    className="rounded-xl"
                  />
                  <Label className="text-gray-700">Email:</Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={signupData.email}
                    onChange={handleChange1}
                    required
                    className="rounded-xl"
                  />
                  <Label className="text-gray-700">Password:</Label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={signupData.password}
                    onChange={handleChange1}
                    required
                    className="rounded-xl"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleSignup}
                    disabled={isDisabled}
                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:brightness-110 rounded-xl
                      ${isDisabled? 'brightness-110' :''}
                      `}
                  >
                    Continue
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
              <DialogTrigger asChild>
              <Button className="px-5 py-2 bg-white text-indigo-700 border border-indigo-600 rounded-xl font-semibold shadow hover:bg-indigo-50 hover:shadow-md transition duration-200">
                    Login
                </Button>
    
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl shadow-lg border-none">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-indigo-700">Login</DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    Log in to access your account securely.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label className="text-gray-700">Email:</Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={loginInfo.email}
                    onChange={handleChange}
                    required
                    className="rounded-xl"
                  />
                  <Label className="text-gray-700">Password:</Label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={loginInfo.password}
                    onChange={handleChange}
                    required
                    className="rounded-xl"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    onClick={handleLogin}
                    disabled={isDisabled}
                    className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:brightness-110 rounded-xl
                      ${isDisabled? 'brightness-110' :''}
                      `}
                  >
                    Continue
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
         
        </div>
      </div>
    </div>
  );
};

export default NavBar;
