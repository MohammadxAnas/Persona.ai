"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Trash2, MoreHorizontal, Share, ChevronsLeft, User2, LogOut } from "lucide-react";

const App = () => {

  const { id } = useParams(); 
  const [bot, setBot] = useState(null);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [sessionId, setSessionId] = useState();
  const [sessions, setSessions] = useState([]);

  const [User, setUser] = useState("");
  const [UserEmail, setUserEmail] = useState("");

  const bottomRef = useRef(null);

  const router = useRouter();

  const fetchBot = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseURL}/api/getBot/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log(data);
      if (data.success) {
        setBot(data.bot);
        setSessionId(data.chatSessionId);
        setSessions(data.chatSessions);
      } else {
        console.error("Error fetching bot:", data.error);
      }
    } catch (err) {
      console.error("Failed to fetch bot:", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBot();
    }
  }, [id]);

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    const storedEmail = localStorage.getItem("UserEmail");
  
    if (storedUser) setUser(storedUser);
    if (storedEmail) setUserEmail(storedEmail);
  
  }, []);
  
  useEffect(() => {
    console.log("Updated bot =", bot);
    console.log("Updated Id =",sessionId);
    console.log("Sessions =",sessions);
  }, [bot, sessionId, sessions]);
  
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const savedSession = localStorage.getItem("session");
    if (savedSession) {
      setSessionId(savedSession);
    }
  }, []);
  
 
  const fetchChatHistory = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/fetchHistory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId, id }),
    });

    const data = await res.json();
    if (data.success) {
      const normalizedMessages = data.messages.map(msg => ({
        text: msg.content,
        sender: msg.sender === "USER" ? "user" : "bot",
      }));
      setMessages(normalizedMessages);
      
    } else {
      console.error("Failed to fetch chat history");
    }
  };

  useEffect(() => {
    if (!sessionId) return ;
    
    fetchChatHistory();
    console.log("messages:",messages);
  }, [sessionId]);

  const handleUnauthorized = () => {
    toast.error("You’ve been logged out because you signed in on another device.");
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    router.push("/");
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;
  
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
  
    try {
      const fullChat = messages
        .map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }))
        .concat([
          {
            role: "user",
            parts: [{ text: input }],
          },
        ]);
  
      const systemIntro = {
        role: "user",
        parts: [
          {
            text: `You are a character named ${bot.name}. Your description is: "${bot.description}". Your personality is: "${bot.personality}". Stay in character while chatting.`,
          },
        ],
      };
  
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [systemIntro, ...fullChat],
          }),
        }
      );
  
      const data = await response.json();
      console.log("response:", data);
  
      const botText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I didn't understand that.";
  
      typeMessage(botText);
      const token = localStorage.getItem("token");

      const saveResponse = await fetch("/api/savemessage", {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({
          userId: bot.userId, 
          characterId: id,
          sessionId : sessionId,
          messages: [
            { sender: "user", text: input },
            { sender: "ai", text: botText },
          ],
        }),
      });
  
      const saveData = await saveResponse.json();
  
     
      if (saveData.sessionId && !sessionId) {
        setSessionId(saveData.sessionId);
        localStorage.setItem("session", saveData.sessionId);
      }
      if (saveData.session) {
        setSessions(saveData.session);
      }
    

    } catch (error) {
      console.error("Error fetching response:", error);
      setIsTyping(false);
    }
  };
  
  const typeMessage = (text) => {
    setIsTyping(false);
    const words = text.split(" ");
    let index = 0;
    let botMessage = "";

    setMessages((prev) => [...prev, { text: "", sender: "bot" }]);

    const interval = setInterval(() => {
      if (index < words.length) {
        botMessage += words[index] + " ";
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            text: botMessage,
            sender: "bot",
          };
          return newMessages;
        });
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
  };

  const startNewChat = () => {
    setMessages([]);
    localStorage.removeItem("session");
    setSessionId(null);
    setSidebarOpen(false);
  };
  
  const delSession = async (sesId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
  
      const response = await fetch(`${baseURL}/api/delsession?sesId=${sesId}`, {
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
        toast.success("deleted successfully!");
        setSessions((prevSessions) => prevSessions.filter((s) => s.id !== sesId));
        if (sessionId === sesId) {
          setSessionId(null);
          setMessages([]);
          localStorage.removeItem("session");
        }
      } else {
        throw new Error(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting :", err.message);
      toast.error(err.message || "Something went wrong");
    }
  }

  const handleLogout = async () => {
      try {
        toast("Logging out...");
        const token = localStorage.getItem("token");
        if (!token) return toast.error("No token found. Cannot logout.");
  
    
        if (!UserEmail) return toast.error("User ID not found in token.");
  
        const response = await fetch(`${baseURL}/api/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: UserEmail }),
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
    <div className="text-white">
    {/* Sidebar */}
    <div
  className={`fixed top-0 left-0 h-full w-[270px] bg-white p-6 border-r border-gray-200 transition-transform duration-300 z-50 shadow-md ${
    sidebarOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
  <div className="flex flex-col h-full justify-between">
    {/* Top Section */}
    <div>
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-6 -mt-3">
        <div className="flex flex-col">
          <span className="text-sm text-gray-500">Welcome,</span>
          <span className="font-medium text-gray-800">{User}</span>
        </div>
        <button onClick={() => setSidebarOpen(false)}>
          <ChevronsLeft className="text-gray-600 hover:text-black" />
        </button>
      </div>

      {/* New Chat Button */}
      <Button
        variant="outline"
        onClick={startNewChat}
        className="w-full py-2 font-medium bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white rounded-xl transition-all"
      >
        + New Chat
      </Button>

      {/* Session List */}
      <div className="mt-6 h-[calc(100vh-280px)] overflow-y-auto pr-1">
        <p className="text-gray-700 font-semibold mb-2">Recent</p>
        <ul className="space-y-2">
          {sessions.map((ses, index) => {
            const isActive = sessionId === ses.id;
            return (
              <li
                key={ses.id || index}
                className={`group flex justify-between items-center px-3 py-2 rounded-lg border cursor-pointer transition ${
                  isActive
                    ? "bg-indigo-100 border-indigo-400 text-indigo-900"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => {
                  setSessionId(ses.id);
                  fetchChatHistory();
                }}
              >
                <span className="text-sm truncate">
                  {ses.title || `Session ${index + 1}`}
                </span>

                <span className="flex items-center ml-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-5 h-5 text-gray-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          delSession(ses.id);
                        }}
                      >
                        <Trash2 className="mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="mr-2" />
                        <span>Share</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>

    {/* Bottom Profile Section */}
    <div className="pt-6 border-t border-gray-200">
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

  
    {/* Sidebar Overlay for mobile */}
    {sidebarOpen && (
      <div
        className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm transition-opacity duration-300 md:hidden"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  
    {/* Main Content */}
    <div
      className={`flex flex-col flex-grow items-center transition-all duration-300 relative z-40 ${
        sidebarOpen ? "md:ml-[270px]" : ""
      }`}
    >
    {/* Header */}
    <header className="container mx-auto flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg rounded-b-xl">
    <div className="flex items-center gap-3 text-lg font-bold z-50 transition-transform duration-300 ease-in-out">
      {!sidebarOpen && (
        <span
          className="cursor-pointer text-white hover:text-gray-200 transition-all duration-300"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </span>
      )}
      {/* Logo Text */}
      <span
        className={`text-3xl font-bold tracking-wide ${sidebarOpen ? "ml-7 md:ml-0" : ""} cursor-pointer -mt-1`}
      >
        persona.ai
      </span>
    </div>
</header>


      {/* Chat Section */}
      {bot ? (
        <div className="w-4/5 max-w-3xl flex flex-col flex-grow mt-20 px-4 pb-24">
          {/* Bot Info */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <img
              src={bot.avatar}
              alt={bot.name}
              className="w-24 h-24 rounded-full object-cover shadow-lg"
            />
            <h2 className="text-2xl font-bold">{bot.name}</h2>
            <p className="text-gray-500 max-w-md">{bot.description}</p>
          </div>
  
          {/* Messages */}
          <div className="flex flex-col gap-4 overflow-y-auto flex-grow pb-20">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-2xl px-4 py-2 max-w-[75%] text-sm md:text-base break-words ${
                  msg.sender === "user"
                    ? "self-end bg-blue-100 text-blue-900"
                    : "self-start bg-gray-100 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="self-start bg-gray-100 text-black px-4 py-2 rounded-xl max-w-[70%]">
                Typing...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center mt-40 space-y-4">
          <div className="text-gray-400">Loading bot info...</div>
        </div>
      )}
  
      {/* Input Bar */}
      {bot && (
        <div
          className={`fixed bottom-5 left-0 right-0 z-50 px-4 transition-all duration-300 ${
            sidebarOpen ? "md:ml-[250px]" : ""
          }`}
        >
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-full shadow-md bg-white max-w-3xl w-full">
              <button
                className="relative w-7 h-7 flex items-center justify-center text-gray-500 border border-gray-300 rounded-full text-lg group hover:bg-gray-100"
                aria-label="Upload"
              >
                +
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  Upload files and more
                </span>
              </button>
  
              <input
                type="text"
                placeholder="Ask anything..."
                className="flex-grow px-3 py-2 text-sm md:text-base outline-none border-none bg-transparent"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
  
              <button
                onClick={sendMessage}
                className="text-gray-600 text-2xl hover:text-blue-500 transition"
                aria-label="Send message"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  
  

  );
};

export default App;
