"use client";
import { Progress } from "@/components/ui/progress"
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Trash2, Phone, MoreHorizontal, Share, ChevronsLeft, User2, LogOut, PlayIcon, ChevronsUpDown, Mic, Plus, Ellipsis} from "lucide-react";

const App = () => {

  const { id } = useParams(); 
  const [bot, setBot] = useState(null);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [Text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [sessionId, setSessionId] = useState();
  const [sessions, setSessions] = useState([]);

  const [User, setUser] = useState("");
  const [UserEmail, setUserEmail] = useState("");

  const [gender, setGender] = useState("");

  const [callActive, setCallActive] = useState(false);

  const bottomRef = useRef(null);

  const router = useRouter();

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      
      const loadVoices = () => {
        const availableVoices = synth.getVoices();
        if (availableVoices.length > 0) {
          setVoices(availableVoices);
        }
      };

      loadVoices();

      synth.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    console.log("voice text:", Text);
    if (Text && Text.trim() !== "") {
      sendMessage();
    }
  }, [Text]);
  

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

  const handleUnauthorized = () => {
    toast.error("You’ve been logged out because you signed in on another device.");
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    router.push("/");
  };

  const fetchBot = async () => {
    startLoading();
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${baseURL}/api/getBot/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      const data = await res.json();
      console.log(data);
      if (data.success) {
        setBot(data.bot);
        setGender(data.bot.gender);
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
    console.log("Gender=",gender);
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

    if (res.status === 401) {
      handleUnauthorized();
      return;
    }

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

  const handleCall = async (txt) => {
    try {
      await handlePlay(txt);
      if (callActive){
        handleCallClick();
      }
    } catch (error) {
      console.error('Error in handleCall:', error);
    }
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

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }
  
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

      if (callActive && botText ) {
          handleCall(botText);
      } else {
        console.log('Skipping empty or undefined Text');
      }
      
      
      setText();
  
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
    startLoading();
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
    startLoading();
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

    const handlePlay = (text) => {
      return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const synth = window.speechSynthesis;
    
          const speech = new SpeechSynthesisUtterance(text);
          let selectedVoice = null;
          const genderNormalized = gender ? gender.toLowerCase() : '';
    
          if (genderNormalized === 'male') {
            selectedVoice = synth.getVoices().find(voice => voice.name === 'Google UK English Male');
          } else if (genderNormalized === 'female') {
            selectedVoice = synth.getVoices().find(voice => voice.name === 'Google UK English Female');
          }
          
    
          if (!selectedVoice) {
            selectedVoice = synth.getVoices().find(voice => voice.lang.startsWith('en'));
          }
    
          if (selectedVoice) {
            speech.voice = selectedVoice;
          }
    
          speech.lang = 'en-GB';
          speech.onend = () => {
            console.log('Speech finished');
            resolve();  
          };
    
          speech.onerror = (error) => {
            console.error('Speech error:', error);
            reject(error);  
          };
    
          synth.cancel();
          synth.speak(speech);
        } else {
          reject('Speech Synthesis not supported.');
        }
      });
    };

    let Recognition = null;
    let recognitionInProgress = false;

    const handleCallClick = () => {
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        Recognition = new SpeechRecognition();
    
        Recognition.lang = 'en-US';
        Recognition.interimResults = false;
        Recognition.maxAlternatives = 1;
    
        Recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(transcript);
            setText(transcript);
          }
        };
    
        Recognition.start();
        recognitionInProgress = true;
      } else {
        alert('Your browser does not support Speech Recognition.');
      }
    };
    const disableMic = () => {
      if (Recognition && recognitionInProgress) {
        Recognition.stop();
        RecognitionInProgress = false;
        Recognition = null;
        console.log("Microphone disabled.");
      } else {
        console.log("No active microphone to disable.");
      }
    };
    
    let recognition = null;

    const handleMicClick = () => {
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
    
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
    
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(transcript);
            setText(transcript);
          }
        };
    
        recognition.start();
      } else {
        alert('Your browser does not support Speech Recognition.');
      }
    };
    

  return (
    <div className="relative text-white">
       {loading && (
        <div className="fixed top-0 left-0 w-full z-[1000]">
          <Progress 
        value={progress} 
        className="h-1 bg-transparent [&>div]:bg-white"
        />
        </div>
      )}
    {/* Sidebar */}
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
    <Button
        className="h-12 w-33 bg-white text-gray-800 border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 hover:text-black transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
        onClick={startNewChat}
      >
        <span className="flex items-center justify-center gap-1">
        <Plus className="w-15 h-15" />
        <div className=" font-sans">New Chat</div>
        </span>
      </Button>
  </div>
  <div className="pb-4 border-b border-gray-200">
    <button
      className="font-light w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-800 transition-all duration-200 hover:bg-gray-100"
      onClick={() => {
        router.push('/dashboard');
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

    <div className="pt-1">
      <p className="text-xs text-gray-400 uppercase tracking-wide">Recent</p>
    </div>

    {/* Session List */}
    <div className="overflow-y-auto pr-1 flex-1">
    <ul className="space-y-2 ">
  {sessions.map((ses, index) => {
    const isActive = sessionId === ses.id;
    return (
      <li
        key={ses.id || index}
        className={`group flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 text-sm
          ${
            isActive
              ? "bg-indigo-100 text-indigo-900"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        onClick={() => {
          setSessionId(ses.id);
          fetchChatHistory();
        }}
      >
        <span className="truncate">{ses.title || `Session ${index + 1}`}</span>

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

    {/* Footer / Profile */}
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="mt-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow hover:bg-gray-100 flex items-center justify-between w-full">
          <span className="truncate">{UserEmail}</span>
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
</div>


  
{sidebarOpen && (
  <div
    className="fixed inset-0 z-40 bg-neutral-50/50 transition-opacity duration-300 md:hidden"
    onClick={() => setSidebarOpen(false)}
  />
)}

  
    {/* Main Content */}
<div className={`transition-all duration-300 relative z-10 overflow-x-hidden ${sidebarOpen ? "md:ml-[270px]" : ""}`}>
<div className="relative">
<header className="fixed w-full max-w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg rounded-b-xl">
      <div className="flex items-center gap-3 text-lg font-bold z-10 transition-transform duration-300 ease-in-out">
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
         <div className="flex items-center justify-center gap-1.5">
        <Button
          onClick={() => {
            setCallActive(true);
            handleCallClick();
          }}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow hover:brightness-110 transition-all duration-300"
        >
          <Phone className="w-7 h-7 text-white fill-current" />
        </Button>

        <Button
          onClick={() => {
    
          }}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow hover:brightness-110 transition-all duration-300"
        >
          <Ellipsis className="w-7 h-7 text-white fill-current" />
        </Button>
      </div>
     </header>

  </div>

  {callActive && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <Button
            variant="destructive"
            className="h-12 w-12 p-0 rounded-full bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              setCallActive(false);
              disableMic();
            }}
          >
            <Phone className="w-6 h-6 rotate-135" />
          </Button>
        </div>
      )}

      {/* Chat Section */}
      {bot ? (
         <div className="flex flex-col items-center ">
        <div className="w-6/7 max-w-3xl flex flex-col items-center flex-grow mt-20 pb-24">
          {/* Bot Info */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <img
            src={bot.avatar || 'https://loremflickr.com/600/400/cat.jpg'} // fallback image
            alt={bot.name}
            className="text-black w-24 h-24 rounded-full object-cover shadow-lg"
          />
            <h2 className="text-black text-2xl font-bold">{bot.name}</h2>
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

              {/* Show Play button only for bot messages */}
              {msg.sender !== "user" && (
              <div className="mt-2 flex items-center justify-start gap-1">
                <div>
                <Avatar className="text-black w-5 h-5 rounded-full object-cover shadow-lg">
                  <AvatarImage src={bot.avatar} alt={bot.name} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
              <div className="group relative p-1 rounded-full cursor-pointer bg-white shadow-md hover:bg-blue-100 hover:shadow-lg transform transition-all duration-300 ease-out hover:scale-110">
                <PlayIcon className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors duration-300" 
                          onClick={() => handlePlay(msg.text)}
                />
              </div>
              </div>
              )}
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
        </div>
      ) : (
        <div className="flex flex-col items-center mt-40 space-y-4">
          <div className="text-gray-400">Loading bot info...</div>
        </div>
      )}
  
      {/* Input Bar */}
      {bot && (
        <div
          className={`text-black fixed bottom-5 left-0 right-0 z-50 px-4 transition-all duration-300 ${
            sidebarOpen ? "md:ml-[250px]" : ""
          }`}
        >
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-full shadow-md bg-white max-w-3xl w-full">
            <button
              onClick={handleMicClick}
              className="relative w-10 h-10 flex items-center justify-center text-indigo-600 bg-white border border-gray-300 rounded-full shadow-md hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300 group"
              aria-label="Start Voice Input"
            >
              <Mic className="w-5 h-5" />
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Start Voice Input
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
