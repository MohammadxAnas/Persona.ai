"use client";
import React, { useState, useEffect } from "react";
import { useParams } from 'next/navigation';


const App = () => {

    const { id } = useParams(); 
    const [bot, setBot] = useState(null);
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (id) {
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
          if (data.success) {
            setBot(data.bot);
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
  }, [bot]);
  


  const sendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: { "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
           },
          body: JSON.stringify({
            model: "gpt-3.5-turbo" ,
            messages: [
              {
                role: "user",
                content: `You are a character named ${bot.name}. Your description is: "${bot.description}". Your personality is: "${bot.personality}". Now respond to the user message: "${userMessage}".`
              }
            ],
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();
      console.log("response:",data);
      const botText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I didn't understand that.";

      typeMessage(botText);
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
    setSidebarOpen(false);
  };

  return (
    <div className="relative min-h-screen font-sans bg-white transition-all duration-300">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[250px] bg-white p-5 border-r border-gray-300 transition-transform duration-300 z-30 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="text-xl text-gray-700 mb-4"
          onClick={() => setSidebarOpen(false)}
        >
          ☰
        </button>
        <ul className="list-none p-0">
          <li>
            <button
              onClick={startNewChat}
              className="w-[120px] text-sm py-2 pl-3 bg-gray-100 rounded-full hover:rounded-md transition-all"
            >
              + New Chat
            </button>
          </li>
        </ul>
        <br />
        <p className="text-gray-800 font-semibold">Recent</p>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
       <div
       className="fixed inset-0 z-20 transition-opacity duration-300"
       onClick={() => setSidebarOpen(false)}
     />
     
      )}

      {/* Main Content */}
      <div
        className={`flex flex-col items-center justify-center transition-all duration-300 relative z-40 ${
          sidebarOpen ? "ml-[250px]" : ""
        }`}
      >
        {/* Header */}
        <div className="absolute top-2 left-2 flex items-center p-4 text-lg font-bold z-50 ">
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

      {/* bot info */}
        {bot ? (
             <div className="flex flex-col items-center mt-24 space-y-4">
             <img
             src={bot.avatar} // replace with your actual bot avatar field
             alt={bot.name}
             className="w-24 h-24 rounded-full object-cover shadow-md"
             />
             <h2 className="text-2xl font-semibold text-center">{bot.name}</h2>
             <p className="text-center text-gray-500 max-w-md">{bot.description}</p>
         </div>
        ) : (
            <div className="text-center mt-24 text-gray-400">Loading bot info...</div>
        )
        }


        {/* Chat Section */}
        <div className="w-4/5 max-w-3xl h-[60vh] overflow-y-auto mt-10 flex flex-col gap-2 px-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`rounded-xl px-4 py-2 max-w-[70%] break-words text-left ${
                msg.sender === "user"
                  ? "self-end bg-gray-100 text-black"
                  : "self-start bg-gray-100 text-black"
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
        </div>

        {/* Input Bar */}
        <div className="absolute bottom-5 w-4/5 max-w-3xl flex items-center px-4 py-2 border border-gray-300 rounded-full shadow-md bg-white z-50">
        <button className="w-6 h-6 flex items-center justify-center text-gray-500 border border-gray-300 rounded-full text-lg relative group">
        +
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Upload files and more
        </span>
        </button>

          <input
            type="text"
            placeholder="Ask anything"
            className="flex-grow px-4 py-2 outline-none border-none text-base"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="text-gray-500 text-xl ml-2" onClick={sendMessage}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
