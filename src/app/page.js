"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";
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
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInfo, setloginInfo] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ name: "", email: "", password: "" });
  const [BotData, setBotData] = useState({ botName: "", botDesc: "", botPersona: "", avatar: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [Bots, setBots] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      const response = await fetch(`${baseURL}/api/getBots?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        return data.bots;
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
        router.replace("/");
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

      const response = await fetch(`${baseURL}/api/createBot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...BotData, userId }),
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

  const deleteBot = async (botId) => {
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
        const updatedBots = await fetchUserBots();
        setBots(updatedBots);
      } else {
        throw new Error(data.error || "Failed to delete bot");
      }
    } catch (err) {
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
        router.replace("/");
      } else {
        toast.error(result.error || "Logout failed");
      }
    } catch (error) {
      toast.error("Something went wrong while logging out.");
    }
  };

  return (
    <div className="text-white flex">
      {/* Sidebar */}
      <div className={`bg-[#101010] w-64 min-h-screen px-4 py-6 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed md:static z-50`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-blue-400">persona.ai</h2>
          <button className="text-white md:hidden" onClick={() => setSidebarOpen(false)}>✖</button>
        </div>
        <ul className="space-y-4">
          <li><a href="#" className="hover:text-blue-400">Dashboard</a></li>
          <li><a href="#" className="hover:text-blue-400">My Bots</a></li>
          <li><a href="#" className="hover:text-blue-400">Settings</a></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-64">
        <header className="flex justify-between items-center px-6 py-4">
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(true)}>☰</button>
          <div>
            {isAuthenticated ? (
              <div className="flex gap-3">
                <Button onClick={handleLogout}>Logout</Button>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="mine">Create Bot</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create a Bot</DialogTitle>
                      <DialogDescription>Start by providing a name, description, and personality.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label>Name:</Label>
                      <Input name="botName" value={BotData.botName} onChange={handleChange2} required />
                      <Label>Description:</Label>
                      <Input name="botDesc" value={BotData.botDesc} onChange={handleChange2} required />
                      <Label>Personality:</Label>
                      <Input name="botPersona" value={BotData.botPersona} onChange={handleChange2} required />
                      <Label>Avatar URL:</Label>
                      <Input name="avatar" value={BotData.avatar || ""} onChange={handleChange2} required />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleCreatebot}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild><Button variant="mine">Sign Up to Chat</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Signup</DialogTitle>
                      <DialogDescription>Create an account to start chatting with AI!</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label>Username:</Label>
                      <Input name="name" value={signupData.name} onChange={handleChange1} required />
                      <Label>Email:</Label>
                      <Input name="email" value={signupData.email} onChange={handleChange1} required />
                      <Label>Password:</Label>
                      <Input name="password" value={signupData.password} onChange={handleChange1} required />
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleSignup}>Continue</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
                  <DialogTrigger asChild><Button>Login</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Login</DialogTitle>
                      <DialogDescription>Log in to access your bots.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Label>Email:</Label>
                      <Input name="email" value={loginInfo.email} onChange={handleChange} required />
                      <Label>Password:</Label>
                      <Input name="password" value={loginInfo.password} onChange={handleChange} required />
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleLogin}>Continue</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </header>

        {isAuthenticated && (
          loading ? (
            <div className="flex h-[80vh] justify-center items-center">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 ml-4">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ) : (
            <ul className="flex flex-wrap gap-6 px-6 py-6 list-none">
              {Bots.map((bot) => (
                <li key={bot.id}>
                  <Card className="w-[300px]">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={bot.avatar} alt="@bot" />
                          <AvatarFallback>AI</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-lg">{bot.name}</CardTitle>
                      </div>
                      <CardDescription>{bot.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => deleteBot(bot.id)}>Delete</Button>
                      <Button>Chat</Button>
                    </CardFooter>
                  </Card>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}
