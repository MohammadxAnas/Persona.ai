"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { Mail, Phone, Trash2, LogOut, ChevronsLeft, User2, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress"


import { Skeleton } from "@/components/ui/skeleton"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


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

  const [BotData, setBotData] = useState({ botname: "", botDesc: "", botPersona: "", avatar: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [Loading, SetLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [User, setUser] = useState("");
  const [UserEmail, setUserEmail] = useState("");


  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setLoading(false);
              setProgress(0);
            }, 300); // small delay before hiding
            return 100;
          }
          return oldProgress + Math.random() * 20; // random speed
        });
      }, 300);
    }
  }, [loading]);

  // Just a fake loading trigger example
  const startLoading = () => {
    setLoading(true);
    setProgress(10);
  };


  const [Bots, setBots] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if(!token){
        router.replace("/");
    }
  }, []);
  
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    const storedEmail = localStorage.getItem("UserEmail");
  
    if (storedUser) setUser(storedUser);
    if (storedEmail) setUserEmail(storedEmail);
  
  }, []);

  useEffect(() => {
    const loadBots = async () => {
      const bots = await fetchUserBots();
      setBots(bots);
    };
    loadBots();
  }, []);

  const handleUnauthorized = () => {
    toast.error("You’ve been logged out because you signed in on another device.");
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    router.push("/");
  };
  
  
  
  const fetchUserBots = async () => {
    SetLoading(true);
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
     
      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
    
      if (response.ok) {
        localStorage.removeItem("session");
        return data.bots; 
      } else {
        throw new Error(data.error || "Failed to fetch bots");
      }
    } catch (err) {
      console.error("Error fetching bots:", err.message);
      return [];
    } finally {
      SetLoading(false);
    }
  };
  
  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setBotData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatebot = async (e) => {
    startLoading();
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
    startLoading();
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
      console.error("Error deleting bot:", err.message);
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleLogout = async () => {
    startLoading(0);
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
        localStorage.removeItem("UserEmail");
        setUser("");          
        setUserEmail(""); 
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

  <div className="relative text-white ">
  <div
    className={`fixed top-0 left-0 h-full w-[270px] bg-white p-6 border-r border-gray-200 transition-transform duration-300 z-50 shadow-md ${
      sidebarOpen ? "translate-x-0" : "-translate-x-full"
    }`}
  >
    <div className="flex flex-col h-full">
      {/* Top Section */}
      <div className="space-y-6">
      <div className="flex items-center justify-between mb-6 -mt-3">
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">Welcome,</span>
        <span className="font-medium text-gray-800">{User}</span>
      </div>

        <button onClick={() => setSidebarOpen(false)}>
          <ChevronsLeft className="text-gray-600 hover:text-black" />
        </button>
      </div>


        {/* Create Bot Button */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full py-2 font-medium bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white rounded-xl transition-all"
            >
              + Create Bot
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[450px] bg-white p-6 rounded-xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">Create a Bot</DialogTitle>
              <DialogDescription className="text-sm text-gray-500">
                Add a name, description, and personality to personalize your bot.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div>
                <Label className="mb-2">Name:</Label>
                <Input
                  name="botName"
                  type="text"
                  value={BotData.botName}
                  onChange={handleChange2}
                  placeholder="e.g., Dr. Helper"
                  required
                />
              </div>

              <div>
                <Label className="mb-2">Description:</Label>
                <Input
                  name="botDesc"
                  type="text"
                  value={BotData.botDesc}
                  onChange={handleChange2}
                  placeholder="e.g., Assists with medical queries"
                  required
                />
              </div>

              <div>
                <Label className="mb-2">Personality:</Label>
                <Input
                  name="botPersona"
                  type="text"
                  value={BotData.botPersona}
                  onChange={handleChange2}
                  placeholder="e.g., Friendly, informative"
                  required
                />
              </div>

              <div>
                <Label className="mb-2">Avatar:</Label>
                <Input
                  name="avatar"
                  type="text"
                  value={BotData.avatar || ""}
                  onChange={handleChange2}
                  placeholder="URL to bot image"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleCreatebot}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div>
          <p className="text-gray-700 font-semibold mb-2">Recent</p>
          {/* You can list recent bots/sessions here */}
        </div>
      </div>

      {/* Bottom Section (User Profile) */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-md hover:brightness-110 transition-all">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col text-left max-w-[180px] truncate">
                <span className="font-semibold truncate">{User}</span>
                <span className="text-sm text-white/80 truncate">{UserEmail}</span>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="ml-44">
            <DropdownMenuItem className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2">
              <User2 className="w-4 h-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-3 py-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </div>


   {sidebarOpen && (
      <div
        className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  <div
     className={`transition-all duration-300 relative z-40 ${sidebarOpen ? "md:ml-[270px]" : "" }`}
  >

    <div className="relative">
    <header
        className={`fixed top-0 transition-all duration-300 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg rounded-b-xl
        ${sidebarOpen ? "left-64" : "left-0"} right-0`}
    >
        <div className="flex items-center gap-3 text-lg font-bold transition-transform duration-300 ease-in-out">
        {!sidebarOpen && (
            <span
            className="cursor-pointer text-white hover:text-gray-200 transition-all duration-300"
            onClick={() => setSidebarOpen(true)}
            >
            ☰
            </span>
        )}
        <span
            className={`text-3xl font-bold tracking-wide ${sidebarOpen ? "ml-7 md:ml-0" : ""} cursor-pointer -mt-1`}
        >
            persona.ai
        </span>
        </div>
    </header>
    </div>

    {loading && (
    <div className="fixed top-0 left-0 w-full z-[1000]">
       <Progress 
        value={progress} 
        className="h-1 bg-transparent [&>div]:bg-white"
        />
    </div>
    )}


    <main className="pt-15">

    {/* Your Created Bots Label */}
    <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
      <div className="px-6 py-4 flex-1">
        <h2 className="text-2xl font-bold text-gray-900">Your Created Bots</h2>
        <p className="text-gray-600 text-sm mt-2">Manage and interact with your AI bots here.</p>
      </div>

      {/* Search input */}
      <div className="mr-5 w-full sm:w-auto mt-4 sm:mt-0 flex-shrink-0">
        <div className="relative">
          {/* Search Icon */}
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
            <Search className="w-6 h-6" />
          </span>

          {/* Input Field */}
          <Input
            placeholder="Search for characters..."
            className="pl-12 pr-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ease-in-out duration-300 hover:border-blue-400 w-full sm:w-[250px] md:w-[300px] lg:w-[350px]"
          />
        </div>
      </div>
    </div>


    {/* Loading state */}
    {Loading && (
    <div className="flex justify-center items-center py-12">
      {/* Container to hold skeletons horizontally */}
      <div className="flex space-x-8">
        {/* First Skeleton Loader */}
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>

        {/* Second Skeleton Loader */}
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>

        {/* Third Skeleton Loader */}
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    </div>
  )}



    {/* Bot List */}
    {!loading && Bots && (
      <ul className="flex overflow-x-auto gap-4 px-4 py-3 list-none scrollbar-hide scroll-smooth snap-x snap-mandatory">
        {Bots.map((bot) => (
          <li key={bot.id} className="snap-start pl-2">
            <Card
              className="w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-indigo-200"
              onClick={() => {
                router.push(`/chat/${bot.id}`);
              }}
              
            >
              <div className="flex h-full items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border border-indigo-200 shadow-sm">
                    <AvatarImage src={bot.avatar} alt={bot.name} />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col">
                    <CardTitle className="text-base font-semibold text-indigo-700">
                      {bot.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 w-[200px]">
                      {bot.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <Button
                    className="h-8 px-3 text-xs rounded-lg gap-1 border-indigo-300 text-indigo-700"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/chat/${bot.id}`);
                    }}
                  >
                    <Mail className="w-4 h-4" />
                    Chat
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-lg border-indigo-300 text-indigo-700"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-lg border-red-200 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBot(bot.id, fetchUserBots);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    )}
    </main>
  </div>
</div>
  )
};
