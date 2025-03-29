import Image from "next/image";
import { Button } from "@/components/ui/button";
import { TypeOutline } from "lucide-react";

export default function Home() {
  return (
    <>
    <div className="bg-gray-900 text-white py-4">
  <header className="container mx-auto flex items-center justify-between px-6">
    {/* Left Section */}
    <div className="flex items-center space-x-4">
      <h1 className="text-2xl font-bold tracking-wide text-blue-400">
        persona.ai
      </h1>
      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition">
        Sign Up to Chat
      </button>
      <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition">
        Login
      </button>
      
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
 <Button variant='outline'>click me!</Button>
 </>
  );
}
