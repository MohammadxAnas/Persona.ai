"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { baseURL } from "./utlils/const";
import { jwtDecode } from "jwt-decode";

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import Link from "next/link";



export default function Home() {

  const [loggedInUser, setLoggedInUser] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInfo, setloginInfo] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("loggedInUser");
    setIsAuthenticated(!!token);
  });
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setloginInfo((prev) => ({ ...prev, [name]: value }));
};

const handleChange1 = (e) => {
  const { name, value } = e.target;
  setSignupData({ ...signupData, [name]: value });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const { email, password } = loginInfo;
  if (!email || !password) {
    return alert("Email, and Password are required!");
  }

  try {
    const url = `${baseURL}/api/login`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginInfo),
    });
    const result = await response.json();
    const { success, message, jwtToken, name, error } = result;

    if (success) {
      localStorage.setItem("token", jwtToken);
      localStorage.setItem("loggedInUser", name);
      alert(message);
      setTimeout(() => {
          router.push("/"); 
        }, 1000);
    } else if(error) {
      const details= error?.details[0].message;
      console.log(details);
    }
  } catch (err) {
    console.log(err);
  }
};

const handleSubmit1 = async (e) => {
  e.preventDefault();
  const { name, email, password } = signupData;
  if (!name || !email || !password) {
    return alert("Name, Email, and Password are required!");
  }

  try {
    const url = `${baseURL}/api/signup`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signupData), 
    });

    const data = await response.json();
    localStorage.setItem("userData",data);
    console.log(data.tempUser);
    if (response.ok) {
      localStorage.setItem("userEmail", email);
      alert("Confirmational Code sent to your Email!");
      setTimeout(() => {
          router.push("/verify"); 
        }, 1000);
    } else {
      alert("Signup Failed!");
    }
  } catch (err) {
    console.log(err);
  }
};

  const handleLogout = async() => {
    try{
      const token = localStorage.getItem("token");
      if (!token) {
          console.error("No token found. Cannot remove account.");
          return;
      }
      const decodedToken = jwtDecode(token); // Decode JWT token
      const userEmail = decodedToken.email ;
      console.log(userEmail);

      if (!userEmail) {
        console.error("User ID not found in token.");
        return;
    }
    const url = `${baseURL}/api/logout`;
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({email: userEmail }),
          });
          const result = await response.json();
          const { success, message, error } = result;
    
          if (success) {
            localStorage.removeItem("token");
            alert(message);
            setTimeout(() => {
                router.push("/"); 
              }, 1000);
          } else  {
            console.error(error || "Logout failed");
          }

    }catch{
      console.error("Error decoding token:", error);
    }
  }
  return (
    <>
    <div className=" text-white py-4">
  <header className="container mx-auto flex items-center justify-between px-6">
    {/* Left Section */}
    <div className="flex items-center space-x-4">
      <h1 className="text-2xl font-bold tracking-wide text-blue-400">
        persona.ai
      </h1>
      {isAuthenticated ? (
          <Button onClick={handleLogout} >Logout</Button>

) : (
  <div className="flex gap-2"> 

    <Dialog>
          <DialogTrigger asChild>
            <Button>Sign Up to Chat</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Signup</DialogTitle>
              <DialogDescription>
              "Create an account to start chatting with intelligent AI characters! Engage in dynamic conversations, get insights, and experience interactive AI like never before. Sign up now and start chatting!"
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Username:
                </Label>
                <Input name="name" 
                 placeholder="enter your name"
                 type="text"
                 value={signupData.name}
                 onChange={handleChange1}
                 required
                 className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email:
                </Label>
                <Input name="email" 
                 type="email"
                 placeholder="email"
                 value={signupData.email}
                 onChange={handleChange1}
                 required
                 className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password:
                </Label>
                <Input name="password" 
                 type="password"
                 placeholder="password"
                 value={signupData.password}
                 onChange={handleChange1}
                 required
                 className="col-span-3" />
              </div>
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
              <DialogDescription>
              "Log in to access your account securely. Enter your registered email and password to continue. If you don’t have an account yet, sign up to get started."
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Email:
                </Label>
                <Input name="email" 
                 type="email"
                 placeholder="email"
                 value={loginInfo.email}
                 onChange={handleChange}
                 required
                 className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Password:
                </Label>
                <Input name="password" 
                 type="password"
                 placeholder="password"
                 value={loginInfo.password}
                 onChange={handleChange}
                 required
                 className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmit}>Continue</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  </div>
)}

    </div>

    {/* Right Section (Search Bar) */}
    <div className="relative">
    </div>
  </header>
</div>
 </>
  );
}
