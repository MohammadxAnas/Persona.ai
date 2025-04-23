"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Trash2, MoreHorizontal, Share, ChevronsLeft } from "lucide-react";

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

  const bottomRef = useRef(null);

  useEffect(() => {
    if (id) {
      const token = localStorage.getItem("token");
      const fetchBot = async () => {
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
  
      fetchBot();
    }
  }, [id]);
  
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
  

  useEffect(() => {
    if (!sessionId) return ;
    const token = localStorage.getItem("token");
    const fetchChatHistory = async () => {
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
      } else {
        throw new Error(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting :", err.message);
      toast.error(err.message || "Something went wrong");
    }
  }

  return (
    <div className="relative min-h-screen font-sans bg-white flex transition-all duration-300">
    {/* Sidebar */}
    <div
      className={`fixed top-0 left-0 h-full w-[250px] bg-white shadow-lg p-5 border-r border-gray-300 transition-transform duration-300 z-50 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}      
    >
      <button
        className="text-xl text-gray-700 mb-4 " 
        onClick={() => setSidebarOpen(false)}
      >
        <ChevronsLeft />
      </button>
      <ul className="list-none p-0">
        <li>
          <Button
            variant="outline"
            onClick={startNewChat}
            className="text-black min-w-[210px] justify-center items-center rounded-full hover:rounded-md transition-all"
          >
            + New Chat
          </Button>
        </li>
      </ul>
  
      <br />
      <div>
        <h2 className="text-xl text-gray-800 font-semibold mb-4">Recent Sessions</h2>
        <ul className="space-y-2">
          {sessions.map((ses, index) => (
            <li
              key={ses.id || index}
              className="flex justify-between items-center p-1 pl-2 pr-2 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => {
                setSessionId(ses.id);
                fetchChatHistory();
              }}
            >
              <span className="text-sm text-gray-700">{index}</span>
              <span className="flex justify-center items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <MoreHorizontal className="w-6 h-6 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                       onClick={(e) => {
                        e.stopPropagation();
                        delSession(ses.id);
                       }}
                    >
                      <Trash2 />
                      <span>Delete</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share />
                      <span>Share</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </li>
          ))}
        </ul>
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
        sidebarOpen ? "md:ml-[250px]" : ""
      }`}
    >
    {/* Header */}
    <div className="absolute top-2 left-2 flex items-center p-4 text-lg font-bold z-50">
      {!sidebarOpen && (
        <span
          className="mr-2 cursor-pointer"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </span>
      )}
      <span className="text-2xl font-bold tracking-wide text-blue-400 pb-1">persona.ai</span>
    </div>

  
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
