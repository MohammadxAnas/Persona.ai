import {
  Github,
  Linkedin,
} from "lucide-react";

const Footer = ({ sidebarOpen }) => {
  return (
    <footer
      className={`
        bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-4 px-6 md:px-20
        bottom-0 left-0 z-10
        transition-all duration-300
        w-full 
        ${sidebarOpen ? "lg:ml-[270px] lg:w-[calc(100%-270px)]" : ""}
      `}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <p className="font-mono font-semibold tracking-wide">
          © {new Date().getFullYear()} persona.ai
        </p>

        <div className="flex flex-wrap gap-6 justify-center text-white/80">
          <a href="/about" className="hover:text-white flex items-center gap-1 transition">
             About
          </a>
          <a href="/blog" className="hover:text-white flex items-center gap-1 transition">
            Blog
          </a>
          <a href="/contact" className="hover:text-white flex items-center gap-1 transition">
             Contact
          </a>
          <a href="/privacy" className="hover:text-white flex items-center gap-1 transition">
             Privacy
          </a>
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
