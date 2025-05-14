"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import {  Trash2, LogOut, ChevronsLeft, User2, ChevronsUpDown, Plus, UserPen, MoreVertical } from "lucide-react";
import { Progress } from "@/components/ui/progress"
import Footer from "@/components/Main/footer";
import { motion } from "framer-motion";


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


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Home() {

  const [BotData, setBotData] = useState({botName: "", botDesc: "", botView: "", avatar: "", botGender: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPModalOpen, setIsPModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [Loading, SetLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [User, setUser] = useState("");
  const [UserEmail, setUserEmail] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isdisabled, setIsdisabled] = useState(false);
  const [Persona, setPersona] = useState({ userName: "", userDesc: "" });
 const [currPersona, setcurrPersona] = useState({ userName: "", userDesc: "" });

  const [progress, setProgress] = useState(0);
  const [query, setQuery] = useState("");

  const [Bots, setBots] = useState([]);
  const [recentBots, setRecentBots] = useState([]);
  const [Dbots, setDbots] = useState([]);

  const [groupedByCategory, setGroupedByCategory] = useState({});

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => ref.current && observer.unobserve(ref.current);
  }, []);

 const characters = [...Bots, ...Dbots];

  const filtered = characters.filter((char) =>
    char.name.toLowerCase().includes(query.toLowerCase())
  );


  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setLoading(false);
              setProgress(0);
            }, 300); 
            return 100;
          }
          return oldProgress + Math.random() * 20; // random speed
        });
      }, 300);
    }
  }, [loading]);


  const startLoading = () => {
    setLoading(true);
    setProgress(10);
  };


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
      const DBots = await fetchDftBots();
      setBots(bots);
      console.log(">>",Bots);
      setDbots(DBots);
      console.log(">>>",Dbots);
    };
    loadBots();
  }, []);

    useEffect(() => {
      console.log(">>",Bots);
      console.log(">>>",Dbots);
  }, [Bots, Dbots]);

  useEffect(() => {
 
  const grouped = Dbots.reduce((acc, bot) => {
    if (!acc[bot.category]) {
      acc[bot.category] = [];
    }
    acc[bot.category].push(bot);
    return acc;
  }, {});

  setGroupedByCategory(grouped);
}, [Dbots]);

  const handleUnauthorized = () => {
    toast.error("You’ve been logged out because you signed in on another device.");
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    router.push("/");
  };
  
  const fetchDftBots = async () => {
    SetLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
  
      const response = await fetch(`${ process.env.NEXT_PUBLIC_BASE_URL}/api/getDefault`, {
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
    
      if (response.status === 404) {
        return;
      }
    

      if (response.ok) {
         console.log(data.characters);
         return data.characters; 
      } else {
        throw new Error(data.error || "Failed to fetch bots");
      }
    } catch (err) {
      console.log("Error fetching bots:", err.message);
      return [];
    } finally {
      SetLoading(false);
    }
  };
  
  const fetchUserBots = async () => {
    SetLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
  
      const decoded = jwtDecode(token);
      const userId = decoded._id;
      console.log(userId);
  
      const response = await fetch(`${ process.env.NEXT_PUBLIC_BASE_URL}/api/getBots?userId=${userId}`, {
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
    
      if (response.status === 404) {   
        return;
      }

      if (response.ok) {
        localStorage.removeItem("session");
        setBots(data.bots);
        return data.bots; 
      } else {
        throw new Error(data.error || "Failed to fetch bots");
      }
    } catch (err) {
      console.log("Error fetching bots:", err.message);
      return [];
    } finally {
      SetLoading(false);
    }
  };

    const fetchRecentBots = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
  
      const decoded = jwtDecode(token);
      const userId = decoded._id;
      console.log(userId);
  
      const response = await fetch(`${ process.env.NEXT_PUBLIC_BASE_URL}/api/recentBots?userId=${userId}`, {
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
    
      if (response.status === 404) {   
        return;
      }

      if (response.ok) {
        setRecentBots(data.bots);
      } else {
        throw new Error(data.error || "Failed to fetch bots");
      }
    } catch (err) {
      console.log("Error fetching bots:", err);
    }
  };

   useEffect(() => {
      fetchRecentBots();
  }, []);

  const handlePersona = (e) => {
    const { name, value } = e.target;
    setPersona((prev) => ({ ...prev, [name]: value }));
  
  };
  const createPersona = async (e) => {
    setIsdisabled(true);
    e.preventDefault();
    const { userName, userDesc } = Persona;
    console.log(userName);
    if (!userName || !userDesc ) {
      setIsdisabled(false);
      return toast.error("Info required!");
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("You must be logged in.");
  
      const decoded = jwtDecode(token);
      const userId = decoded._id;
      console.log(userId);

      const response = await fetch(`${ process.env.NEXT_PUBLIC_BASE_URL}/api/persona`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...Persona,      
          userId,          
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setcurrPersona({
          userName: data.persona.name,
          userDesc: data.persona.description
        });
        console.log(data.persona);
        setIsPModalOpen(false);
        toast.success(data.message);
      } else {
        toast.error(data.error || "Failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }finally{
      setIsdisabled(false);
      setPersona({userName: "", userDesc: "" })
    }
  };

  const updatePersona = async (e) => {
    setIsdisabled(true);
    e.preventDefault();
    const { userName, userDesc } = Persona;
    console.log(userName);
    if (!userName || !userDesc ) {
      setIsdisabled(false)
      return toast.error("Info required!");
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("You must be logged in.");
  
      const decoded = jwtDecode(token);
      const userId = decoded._id;
      console.log(userId);

      const response = await fetch(`${ process.env.NEXT_PUBLIC_BASE_URL}/api/uptpersona`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...Persona,      
          userId,          
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();
      if (data.success) {
        setcurrPersona({
          userName: data.persona.name,
          userDesc: data.persona.description
        });
        fetchPersona();
        console.log(data.persona);
        setIsPModalOpen(false);
        toast.success(data.message);
      } else {
        toast.error(data.error || "Failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    }finally{
      setIsdisabled(false);
      setPersona({userName: "", userDesc: "" })
    }
  };

  const fetchPersona = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("You must be logged in.");
    
        const decoded = jwtDecode(token);
        const userId = decoded._id;
    
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getPersona?userId=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (res.status === 404) {
          setcurrPersona({
            userName: "",
            userDesc: ""
          });
          return;
        }
    
        const data = await res.json();
        console.log(data);
    
        if (data.success) {
          console.log("persona:",data.persona);
          localStorage.setItem("Name",data.persona.name);
          localStorage.setItem("Desc",data.persona.description);
        } else {
          console.error("Error fetching persona:", data.error);
        }
    
      } catch (err) {
        console.error("Failed to fetch persona:", err);
      }
    };
  
    useEffect(() => {
      const namedft = localStorage.getItem("Name");
      console.log("name:",namedft);
      const descdft = localStorage.getItem("Desc");
      console.log("desc:",descdft);
      setcurrPersona({
        userName: namedft,
        userDesc: descdft
      });
  },[]);
  
  const handleChange2 = (e) => {
    const { name, value } = e.target;
    setBotData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatebot = async (e) => {
    setIsDisabled(true);
    e.preventDefault();
    const { botName, botDesc, botView } = BotData;
    console.log(botName);
    if (!botName || !botDesc || !botView) {
      setIsDisabled(false);
      return toast.error("Bot info required!");
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("You must be logged in.");
  
      const decoded = jwtDecode(token);
      const userId = decoded._id;
      console.log(userId);

      const response = await fetch(`${ process.env.NEXT_PUBLIC_BASE_URL}/api/createBot`, {
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
    }finally{
      setIsDisabled(false);
      setBotData({botName: "", botDesc: "", botView: "", avatar: "", botGender: "" })
    }
  };

    useEffect(() => {
      console.log("persona",currPersona);
      fetchPersona();
    }, [Bots]);
  
  const deleteBot = async (botId) => {
    setIsDisabled(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
  
      const response = await fetch(`${ process.env.NEXT_PUBLIC_BASE_URL}/api/delBot?botId=${botId}`, {
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
    } finally{
      setIsDisabled(false);
    }
  };

  const handleLogout = async () => {
    startLoading();
    try {
      toast("Logging out...");
      const token = localStorage.getItem("token");
      if (!token) return toast.error("No token found. Cannot logout.");

      const decodedToken = jwtDecode(token);
      const userEmail = decodedToken.email;
      if (!userEmail) return toast.error("User ID not found in token.");

      const response = await fetch(`${ process.env.NEXT_PUBLIC_BASE_URL}/api/logout`, {
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
        localStorage.removeItem("Name");
        localStorage.removeItem("Desc");
        setUser("");          
        setUserEmail(""); 
        toast.success(result.message);
        router.replace("/");  // Redirect immediately
      } else {
        toast.error(result.error || "Logout failed");
      }
    } catch (error) {
      toast.error("Something went wrong while logging out.");
    } finally{
      setLoading(false);
    }
  };

  return (
<div className="overflow-x-hidden scrollbar-hide">

  <div className=" text-white ">
    <div
      className={`fixed top-0 left-0 h-full w-[270px] bg-white p-4 border-r border-gray-200 transition-transform duration-300 z-50 shadow-md ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full space-y-4">

        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs text-gray-400 uppercase">Welcome,</h2>
            <h3 className="font-semibold text-gray-800 truncate">{User}</h3>
          </div>
          <button onClick={() => setSidebarOpen(false)}>
            <ChevronsLeft className="text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* Create Bot Button */}
     <div className="pt-2">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
         <Button
                 className="h-12 w-33 bg-white text-gray-800 border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 hover:text-black transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
               >
                 <span className="flex items-center justify-center gap-1">
                 <Plus className="w-15 h-15" />
                 <div className=" font-sans">Create</div>
                 </span>
               </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[450px] bg-white p-6 rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle>Create a character</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
            Fill out the details below to bring your character to life.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <Label className="pb-1 block">Character Name</Label>
              <Input
                name="botName"
                type="text"
                value={BotData.botName}
                onChange={handleChange2}
                placeholder="e.g., Kwame 'Krazy K' Dolo"
                required
                maxLength={25}
              />
            </div>
            <div>
              <Label className="pb-1 block">Short Description</Label>
              <Input
                name="botDesc"
                type="text"
                value={BotData.botDesc}
                onChange={handleChange2}
                placeholder="e.g., A wild and funny street legend"
                required
              />
            </div>
            <div>
              <Label className="pb-1 block">Backstory / Overview</Label>
              <Input
                name="botView"
                type="text"
                value={BotData.botView}
                onChange={handleChange2}
                placeholder="e.g., Grew up in Soweto, known for wild antics"
                required
              />
            </div>
            <div>
              <Label className="pb-1 block">Avatar Image URL</Label>
              <Input
                name="avatar"
                type="text"
                value={BotData.avatar || ""}
                onChange={handleChange2}
                placeholder="Image URL"
              />
            </div>
            <div>
              <Label className="pb-1 block">Gender</Label>
              <select
                name="botGender"
                value={BotData.botGender}
                onChange={handleChange2}
                required
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleCreatebot}
              disabled={isDisabled}
              className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:brightness-110 rounded-xl
                      ${isDisabled? 'brightness-110' :''}
                      `}
            >
              Create Character
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    {/* Discover Button */}
    <div>
      <button
        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-800 transition-all duration-200 hover:bg-gray-200 sm:bg-gray-100"
        onClick={() => {
          fetchUserBots();
          SetLoading(true);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path
            d="M12 2a9 9 0 0 0-9 9v11l3-3 3 3 3-3 3 3 3-3 3 3V11a9 9 0 0 0-9-9z"
            fill="grey"
            stroke="grey"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="10" r="1" fill="white" />
          <circle cx="15" cy="10" r="1" fill="white" />
        </svg>
        <span className="text-sm font-medium">Discover</span>
      </button>
    </div>

    <div className="border-b border-gray-200 pb-4">
    <Dialog open={isPModalOpen} onOpenChange={setIsPModalOpen}>
          <DialogTrigger asChild>
          <button
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-800 transition-all duration-200 hover:bg-gray-200 sm:bg-gray-100"
          >
          <UserPen className="w-6 h-6 text-gray-500 fill-grey-500" />

            <span className="text-sm font-medium">Persona</span>
          </button>
          </DialogTrigger>

        <DialogContent className="sm:max-w-[450px] bg-white p-6 rounded-xl shadow-xl">
        <DialogHeader>
          <DialogTitle>Set Your Persona</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Introduce yourself to the AI. Your persona helps shape how characters interact with you during conversations.
            This persona will be used as the default, but you can create or switch personas anytime during a conversation.
          </DialogDescription>
        </DialogHeader>


        <div className="grid gap-4 py-4">
          <div>
            <Label className="pb-1 block">Display Name</Label>
            <input
              name="userName"
              type="text"
              value={Persona.userName}
              onChange={handlePersona}
              placeholder={
                currPersona.userName
                  ? currPersona.userName
                  : "Enter your persona's name (e.g., 'Alex The Bold')"
            }
              required
              maxLength={25}
               className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 text-sm text-gray-800 placeholder-gray-400 bg-white resize-none transition-all"
            />
          </div>

          <div>
          <Label className="pb-1 block">About You</Label>
          <textarea
            name="userDesc"
            value={Persona.userDesc}
            onChange={handlePersona}
            placeholder={
              currPersona.userDesc
                ? currPersona.userDesc
                : "Write a little bit about your persona (e.g., 'A fearless hero on a mission to save the world')"
          }
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-300 text-sm text-gray-800 placeholder-gray-400 bg-white resize-none transition-all"

          />
        </div>

        </div>

        <DialogFooter>
          {currPersona.userName === "" && currPersona.userDesc === "" ? (
            <Button
              onClick={createPersona}
              disabled={isdisabled}
              className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:brightness-110 rounded-xl
                        ${isdisabled? 'brightness-110' :''}
                      `}
            >
              Save Persona
            </Button>
          ) : (
            <Button
              onClick={updatePersona}
              disabled={isdisabled}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg
                ${isdisabled 
                  ? 'bg-gray-400 border-gray-300 text-gray-50 cursor-not-allowed' 
                  : ''}`}
            >
              Update Persona
            </Button>
          )}
        </DialogFooter>

      </DialogContent>

      </Dialog>
    
    </div>

    {/* Recent Bots Section */}
    <div>
      <h4 className="text-xs text-gray-400 uppercase tracking-wide mb-2">Recent Bots</h4>
      <ul className="space-y-3">
        {recentBots && recentBots.length > 0 ? (
          recentBots.map((recent) => {
            const botId = recent.aiCharacterId || recent.dftCharacterId;
            const bot = characters.find((char) => char.id === botId);
            if (!bot) return null;

            return (
              <li
                key={recent.id}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer transition-all"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <img
                  src={bot.avatar || "/placeholder.png"}
                  alt={bot.name}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-300"
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[160px]">{bot.name}</span>
                  <span className="text-xs text-gray-500 truncate max-w-[160px]">{bot.description}</span>
                </div>
              </li>
            );
          })
        ) : (
          <li className="text-sm text-gray-600">No recent bots</li>
        )}
      </ul>

    </div>


    <div className="flex-grow" />

  
    <DropdownMenu>
      <DropdownMenuTrigger className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow hover:bg-gray-100 flex items-center justify-between w-full">
        <span>{UserEmail}</span>
        <ChevronsUpDown className="w-4 h-4 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="mt-2 shadow-lg rounded-md">
        <DropdownMenuItem className="px-3 py-2 hover:bg-gray-100 flex gap-2">
          <User2 className="w-4 h-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="px-3 py-2 text-red-600 hover:bg-gray-100 flex gap-2"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</div>



    {sidebarOpen && (
      <div
        className="fixed inset-0 z-40 bg-neutral-50/50 transition-opacity duration-300 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}

    <div className={`transition-all duration-300 relative  overflow-x-hidden ${sidebarOpen ? ":ml-[270px]" : ""}`}>
    <div className="relative">
    <header
      className={`fixed top-0 left-0 z-30 flex items-center justify-between pl-6 pr-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg  transition-all duration-300 
        w-full ${sidebarOpen ? "lg:ml-[270px] lg:w-[calc(100%-270px)]" : ""}
    `}
    >
      <div className="flex items-center gap-3 text-lg font-bold transition-transform duration-300 ease-in-out">
        {!sidebarOpen && (
          <span
            className="cursor-pointer text-white hover:text-gray-200 transition-all duration-300"
            onClick={() => {
              setSidebarOpen(true);
            }}
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


  <main className={`mx-1 mb-20 pt-22 transition-all duration-300 relative overflow-x-hidden scrollbar-hide ${sidebarOpen ? "lg:ml-[270px]" : ""}`}>
   
 <div className="w-full max-w-3xl mx-auto px-4 mb-5 relative ">
      {/* Search Input Container */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search characters..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full py-3 pl-5 pr-14 rounded-xl border border-gray-200 bg-white text-gray-700
            shadow-sm hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-gray-100 focus:border-gray-300
            transition-all duration-200"
        />
        {/* Search Icon Button */}
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
            />
          </svg>
        </button>

        {query && (
          <div className="absolute z-10 top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-2 max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-gray-500 px-4 py-3 text-sm">No characters found.</p>
            ) : (
              filtered.map((char, i) => (
                <div
                  key={i}
                  onClick={() => router.push(`/chat/${char.id}`)}
                  className="px-4 py-3 border-b last:border-none hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center  gap-2">
                  <div className="w-9 h-9 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                     <img src={char.avatar} alt={char.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{char.name}</h3>
                    <p className="text-sm text-gray-500">{char.description}</p>
                  </div>
                   </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>

    {/* Bot List */}
     

  {/* Loading state */}
    <div>
       <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Anime</h2>

            {/* Conditional Loading Skeleton */}
          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
               <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>

      {!Loading && Dbots && groupedByCategory["ANIME"] && (
        <div>
          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["ANIME"].map((bot) => (
              <li key={bot.id} className="snap-start">
              <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
            <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Historical</h2>

            {/* Conditional Loading Skeleton */}
          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      { !Loading && Dbots && groupedByCategory["Historical"] && (
        <div>

          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["Historical"].map((bot) => (
              <li key={bot.id} className="snap-start">
                <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
            <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Fantasy</h2>

            {/* Conditional Loading Skeleton */}
          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
               <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      {!Loading && Dbots && groupedByCategory["Fantasy"] && (
        <div>
        
          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["Fantasy"].map((bot) => (
              <li key={bot.id} className="snap-start">
                <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
         <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Real_Person</h2>
          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
               <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      {!Loading && Dbots && groupedByCategory["Real_Person"] && (
        <div>
        
          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["Real_Person"].map((bot) => (
              <li key={bot.id} className="snap-start">
                <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
          <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Celebrity</h2>

          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
               <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      {!Loading && Dbots && groupedByCategory["Celebrity"] && (
        <div>
        
          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["Celebrity"].map((bot) => (
              <li key={bot.id} className="snap-start">
                <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
            <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Mythological</h2>

          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
               <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      {!Loading && Dbots && groupedByCategory["Mythological"] && (
        <div>
        
          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["Mythological"].map((bot) => (
              <li key={bot.id} className="snap-start">
                <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
            <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Superhero</h2>

            {/* Conditional Loading Skeleton */}
          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
               <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      {!Loading && Dbots && groupedByCategory["Superhero"] && (
        <div>

          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["Superhero"].map((bot) => (
              <li key={bot.id} className="snap-start">
                <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
            <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Villain</h2>

            {/* Conditional Loading Skeleton */}
          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
               <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      { !Loading && Dbots && groupedByCategory["Villain"] && (
        <div>

          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["Villain"].map((bot) => (
              <li key={bot.id} className="snap-start">
                <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
            <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Sci-Fi</h2>

            {/* Conditional Loading Skeleton */}
          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
               <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      {!Loading && Dbots && groupedByCategory["Sci-Fi"] && (
        <div>
        
          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["Sci-Fi"].map((bot) => (
              <li key={bot.id} className="snap-start">
                <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
            <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Game</h2>

            {/* Conditional Loading Skeleton */}
          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
               <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      { !Loading && Dbots && groupedByCategory["Game"] && (
        <div>

          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["Game"].map((bot) => (
              <li key={bot.id} className="snap-start">
                <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
            <h2 className="text-xl font-bold text-indigo-700 py-2 pl-4">Custom</h2>

            {/* Conditional Loading Skeleton */}
          {Loading && (
            <div className="flex justify-start scrollbar-hide items-center py-4 overflow-x-auto px-2 space-x-2">
              {[...Array(5)].map((_, index) => (
               <div
                  key={index}
                  className=" w-[400px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-lg border border-indigo-200 p-4 animate-pulse flex items-center"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full border border-indigo-200 shadow-sm" />
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="h-4 w-[180px] bg-gray-200 rounded" />
                    <div className="h-4 w-[225px] bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
      { !Loading && Dbots && groupedByCategory["Custom"] && (
        <div>
        
          <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
            {groupedByCategory["Custom"].map((bot) => (
              <li key={bot.id} className="snap-start">
                <Card
                className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
                onClick={() => router.push(`/chat/${bot.id}`)}
              >
                <div className="flex h-full items-center px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                      <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                        {bot.name}
                      </h3>
                      <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                        {bot.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              </li>
            ))}
          </ul>
        </div>
      )}

 {!Loading && Bots.length > 0 && (
        
        <>
        {console.log("Bots:", Bots)}
         <div className="pl-4">
            <h1 className="text-xl font-bold text-indigo-700 mt-2">Your Characters</h1>
            <p className="text-gray-600 text-sm mt-1">
              Browse and manage your AI personas.
            </p>
          </div>
        <ul className="flex overflow-x-auto scrollbar-hide py-3 list-none scroll-smooth snap-x snap-mandatory">
          {Bots.map((bot, index) => (
            <li
              key={bot.id}
              className="snap-start"
            >

            <Card
              className="ml-2 w-[340px] h-[140px] bg-gradient-to-r from-indigo-50 to-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-200"
              onClick={() => router.push(`/chat/${bot.id}`)}
            >
              {/* Dropdown Menu Trigger */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="outline-none absolute ml-75 rounded hover:bg-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={5} className="w-32">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBot(bot.id);
                    }}
                    disabled={isDisabled}
                    className={isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-red-500'}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Card Content */}
              <div className="flex h-full items-center px-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border border-indigo-200 shadow-sm overflow-hidden">
                    <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-base font-semibold text-indigo-700 leading-tight">
                      {bot.name}
                    </h3>
                    <p className="text-sm text-gray-600 w-[225px] line-clamp-2 leading-snug">
                      {bot.description}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            </li>
          ))}
        </ul>
        </>
      )}

       <div ref={ref}   className="w-full mt-20 flex items-center justify-center overflow-x-hidden scrollbar-hide px-4">
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-6 py-6 rounded-xl shadow-xl w-full max-w-3xl text-center"
            >
              <h2 className="text-2xl font-semibold mb-2">Ready to Create Your Own Character?</h2>
              <p className="text-white/80 mb-4">
                Craft personalized AI characters with unique traits and behavior — just the way you imagine.
              </p>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-white text-indigo-600 font-semibold px-5 py-2 rounded-lg shadow hover:bg-gray-100 transition hover:cursor-pointer">
                <Plus size={18} /> Create Character
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[450px] bg-white p-6 rounded-xl shadow-xl">
              <DialogHeader>
                <DialogTitle>Create a character</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                Fill out the details below to bring your character to life.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label className="pb-1 block">Character Name</Label>
                  <Input
                    name="botName"
                    type="text"
                    value={BotData.botName}
                    onChange={handleChange2}
                    placeholder="e.g., Kwame 'Krazy K' Dolo"
                    required
                    maxLength={25}
                  />
                </div>
                <div>
                  <Label className="pb-1 block">Short Description</Label>
                  <Input
                    name="botDesc"
                    type="text"
                    value={BotData.botDesc}
                    onChange={handleChange2}
                    placeholder="e.g., A wild and funny street legend"
                    required
                  />
                </div>
                <div>
                  <Label className="pb-1 block">Backstory / Overview</Label>
                  <Input
                    name="botView"
                    type="text"
                    value={BotData.botView}
                    onChange={handleChange2}
                    placeholder="e.g., Grew up in Soweto, known for wild antics"
                    required
                  />
                </div>
                <div>
                  <Label className="pb-1 block">Avatar Image URL</Label>
                  <Input
                    name="avatar"
                    type="text"
                    value={BotData.avatar || ""}
                    onChange={handleChange2}
                    placeholder="Image URL"
                  />
                </div>
                <div>
                  <Label className="pb-1 block">Gender</Label>
                  <select
                    name="botGender"
                    value={BotData.botGender}
                    onChange={handleChange2}
                    required
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                  >
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleCreatebot}
                  disabled={isDisabled}
                  className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:brightness-110 rounded-xl
                        ${isDisabled? 'brightness-110' :''}
                      `}
                >
                  Create Character
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      
            </motion.div>
          )}
        </div>
        </main>
      </div>
    
      <Footer sidebarOpen={sidebarOpen} />
    </div>
    </div>

  )
};
