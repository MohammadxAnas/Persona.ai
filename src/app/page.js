"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { Mail, Phone, Trash2 } from "lucide-react";


import { Skeleton } from "@/components/ui/skeleton"

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

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
 


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInfo, setloginInfo] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [BotData, setBotData] = useState({ botname: "", botDesc: "", botPersona: "", avatar: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
   const [sidebarOpen, setSidebarOpen] = useState(false);


  const [Bots, setBots] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);
  

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadBots = async () => {
      const bots = await fetchUserBots();
      setBots(bots);
    };
    loadBots();
  }, [isAuthenticated]);

  const handleUnauthorized = () => {
    toast.error("You’ve been logged out because you signed in on another device.");
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    router.push("/");
  };
  
  
  
  const fetchUserBots = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
  
      const decoded = jwtDecode(token);
      const userId = decoded._id;
      console.log(userId);
  
      const response = await fetch(`${baseURL}/api/getBots?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
     

      const data = await response.json();
     
    
      if (response.ok) {
        return data.bots; // Assuming the backend returns { bots: [...] }
      } else {
        throw new Error(data.error || "Failed to fetch bots");
      }
    } catch (err) {
      console.error("Error fetching bots:", err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setloginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange1 = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setBotData((prev) => ({ ...prev, [name]: value }));
  };


  const handleLogin = async (e) => {
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
        setIsAuthenticated(true);
        toast.success(result.message);
        router.replace("/");  // Redirect immediately
      } else {
        toast.error(result.message || result.error || "Login failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSignup = async (e) => {
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

  const handleCreatebot = async (e) => {
    e.preventDefault();
    const { botName, botDesc, botPersona } = BotData;
    if (!botName || !botDesc || !botPersona) {
      return toast.error("Bot info required!");
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("You must be logged in.");
  
      const decoded = jwtDecode(token);
      const userId = decoded._id;
      console.log(userId);

      const response = await fetch(`${baseURL}/api/createBot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...BotData,      
          userId,          
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        toast.success(data.message);
        const updatedBots = await fetchUserBots(); 
        setBots(updatedBots); 
      } else {
        toast.error(data.error || "Failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }
  };
  
  const deleteBot = async (botId, fetchUserBots) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
  
      const response = await fetch(`${baseURL}/api/delBot?botId=${botId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
  
      const data = await response.json();
  
      if (response.ok) {
        toast.success("Bot deleted successfully!");
        const updatedBots = await fetchUserBots(); // Fetch fresh bots
        setBots(updatedBots); 
      } else {
        throw new Error(data.error || "Failed to delete bot");
      }
    } catch (err) {
      console.error("Error deleting bot:", err.message);
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleLogout = async () => {
    try {
      toast("Logging out...");
      const token = localStorage.getItem("token");
      if (!token) return toast.error("No token found. Cannot logout.");

      const decodedToken = jwtDecode(token);
      const userEmail = decodedToken.email;
      if (!userEmail) return toast.error("User ID not found in token.");

      const response = await fetch(`${baseURL}/api/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    {/* Only show the sidebar if the user is authenticated */}
    {isAuthenticated && (
      <div
        className={`fixed top-0 left-0 h-full w-[250px] bg-white p-5 border-r border-gray-300 transition-transform duration-300 z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="cursor-pointer text-xl text-black mb-4"
          onClick={() => setSidebarOpen(false)}
        >
          ☰
        </button>
        <ul className="list-none p-0">
          <li>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="text-black min-w-[210px] justify-center items-center"
                >
                  Create Bot
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create a Bot</DialogTitle>
                  <DialogDescription>
                    Start by providing a name, description, and personality for your bot.
                  </DialogDescription>
                </DialogHeader>
  
                <div className="grid gap-4 py-4">
                  <div>
                    <Label>Name:</Label>
                    <Input
                      name="botName"
                      type="text"
                      value={BotData.botName}
                      onChange={handleChange2}
                      required
                      placeholder="e.g., Dr. Helper"
                    />
                  </div>
  
                  <div>
                    <Label>Description:</Label>
                    <Input
                      name="botDesc"
                      type="text"
                      value={BotData.botDesc}
                      onChange={handleChange2}
                      required
                      placeholder="What is this bot for?"
                    />
                  </div>
  
                  <div>
                    <Label>Personality:</Label>
                    <Input
                      name="botPersona"
                      type="text"
                      value={BotData.botPersona}
                      onChange={handleChange2}
                      required
                      placeholder="e.g., Friendly, professional..."
                    />
                  </div>
  
                  <div>
                    <Label>Avatar:</Label>
                    <Input
                      name="avatar"
                      type="text"
                      value={BotData.avatar || ""}
                      onChange={handleChange2}
                      required
                      placeholder="e.g., https://example.com/avatar.png"
                    />
                  </div>
                </div>
  
                <DialogFooter>
                  <Button onClick={handleCreatebot}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </li>
        </ul>
        <br />
        <p className="text-gray-800 font-semibold">Recent</p>
      </div>
    )}
  
    {/* Overlay when sidebar is open */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 z-20 transition-opacity duration-300"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  
    {/* Content Wrapper */}
    <div
      className={`transition-all duration-300 ease-in-out ${
        sidebarOpen && isAuthenticated ? "ml-0 md:ml-[250px]" : "ml-0"
      }`}
    >
      <div className="transition-all duration-300 ease-in-out">
      <header className="container mx-auto flex items-center justify-between px-6">
      {/* Persona.ai Name with Hamburger */}
      <div
        className={`flex items-center gap-3 text-lg font-bold z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-[10px]" : "translate-x-0"
        }`}
      >
        {/* Hamburger Icon */}
        {!sidebarOpen && isAuthenticated && (
          <span
            className="cursor-pointer text-black"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </span>
        )}
        <span
        className={`text-2xl font-bold tracking-wide text-blue-400 pb-1 ${
          sidebarOpen ? "ml-7 md:ml-0" : ""
        }`}
      >
        persona.ai
      </span>

      </div>

  
          <div>
            {isAuthenticated ? (
              <div className="flex gap-3">
                <Button onClick={handleLogout}>Logout</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                {/* Sign Up Dialog */}
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
                      <Label>Username:</Label>
                      <Input
                        name="name"
                        placeholder="Enter your name"
                        type="text"
                        value={signupData.name}
                        onChange={handleChange1}
                        required
                      />
                      <Label>Email:</Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={signupData.email}
                        onChange={handleChange1}
                        required
                      />
                      <Label>Password:</Label>
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
                      <Button type="submit" onClick={handleSignup}>
                        Continue
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
  
                {/* Login Dialog */}
                <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
                  <DialogTrigger asChild>
                    <Button>Login</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Login</DialogTitle>
                      <DialogDescription>
                        Log in to access your account securely.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label>Email:</Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={loginInfo.email}
                        onChange={handleChange}
                        required
                      />
                      <Label>Password:</Label>
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
                      <Button type="submit" onClick={handleLogin}>
                        Continue
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </header>
        {isAuthenticated && loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        )}


  
        {/* Conditional Bot List Rendering */}
        {isAuthenticated && !loading && Bots && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 py-6 list-none">
          {Bots.map((bot) => (
            <li key={bot.id}>
                    <Card
                className="w-full cursor-pointer hover:shadow-lg transition-shadow duration-300"
                onClick={() => router.push("/chat")}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={bot.avatar} alt={bot.name} />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {bot.name}
                      <span className="text-sm text-gray-500 font-normal">(he/him)</span>
                    </CardTitle>
                  </div>
                  <CardDescription>{bot.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-wrap gap-2 justify-between">
                <Button
                  className="flex-1 min-w-[100px] justify-center items-center gap-2"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push("/chat");
                  }}
                >
                  <Mail className="w-5 h-5" />
                  Message
                </Button>

                <Button className="flex-1 min-w-[80px]" variant="outline">
                  <Phone className="w-5 h-5" />
                </Button>

                <Button
                  className="flex-1 min-w-[80px]"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBot(bot.id, fetchUserBots);
                  }}
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </Button>
              </CardFooter>

              </Card>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
  


  );
}
