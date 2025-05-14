"use client";
import Main from "@/components/landingPage/main";
import NavBar from "@/components/landingPage/navbar";

import {
  Github,
  Linkedin,
} from "lucide-react";

export default function Page() {

  return (
<>
    <NavBar/>

    <Main/>

<footer className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-10 px-6 md:px-20 mt-20">
  <div className="flex flex-col md:flex-row justify-between gap-8">
    
    {/* Logo and Description */}
    <div>
      <h2 className="text-2xl font-bold font-mono tracking-wide">persona.ai</h2>
     <p className="text-white/80 mt-2 max-w-sm text-sm">
        Developed by Anas — focused on building intelligent AI solutions that enhance digital interaction.
      </p>

    </div>

    {/* Quick Links */}
    <div>
      <h3 className="text-white font-semibold text-lg mb-2">Quick Links</h3>
      <ul className="space-y-2 text-sm text-white/80">
        <li><a href="/about" className="hover:text-white">About</a></li>
        <li><a href="/blog" className="hover:text-white">Blog</a></li>
        <li><a href="/contact" className="hover:text-white">Contact</a></li>
        <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
      </ul>
    </div>

    {/* Personal Links */}
    <div>
      <h3 className="text-white font-semibold text-lg mb-2">Connect with Me</h3>
      <ul className="space-y-2 text-sm text-white/80">
          <a
            href="https://github.com/MohammadxAnas"
            target="_blank"
            className="hover:text-white flex items-center gap-1 transition"
          >
            <Github size={16} /> GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/mohammad-anas-qadar-602b30323/"
            target="_blank"
            className="hover:text-white flex items-center gap-1 transition"
          >
            <Linkedin size={16} /> LinkedIn
          </a>
      </ul>
    </div>
  </div>

  <div className="mt-10 text-center text-xs text-white/60">
    © {new Date().getFullYear()} persona.ai — Built with passion by Anas.
  </div>
</footer>


  </>    
  )
}

