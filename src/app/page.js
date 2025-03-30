"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { baseURL } from "./utlils/const";
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button"
import Link from "next/link";



export default function Home() {

  const [loggedInUser, setLoggedInUser] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("loggedInUser");
    setIsAuthenticated(!!token);
  
    if (!token) {
      router.push("/login"); // Redirect to login if no token found
    } else {
      setLoggedInUser(user);
    }
  });

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
                router.push("/login"); 
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
  <Button onClick={handleLogout} >
    Logout
  </Button>
) : (
  <div className="flex gap-2"> 
    <Button asChild>
      <Link href="/signup">Sign Up to Chat</Link>
    </Button>
    <Button asChild>
      <Link href="/login">Login</Link>
    </Button>
  </div>
)}

    </div>

    {/* Right Section (Search Bar) */}
    <div className="relative">
      <input
        type="text"
        placeholder="Search..."
        className="bg-gray-800 text-white px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-blue-400 transition w-64"
      />
    </div>
  </header>
</div>
 </>
  );
}
