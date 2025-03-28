"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const baseURL = "http://localhost:3000";

export default function SignupPage() {
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupData;
    if (!name || !email || !password) {
      return alert("Name, Email, and Password are required!");
    }

    try {
      const url = `${baseURL}/api/signup`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      if (response.ok) {
        localStorage.setItem("userEmail", email);
        alert("Confirmational Code sent to your Email!");
        setTimeout(() => {
            router.push("/verify"); 
          }, 1000);
      } else {
        alert("Signup Failed!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('/ai-bg.webp')] bg-cover bg-center bg-no-repeat">
    <div className="bg-white/20 backdrop-blur-md p-8 shadow-lg rounded-lg max-w-sm w-full border border-white/30">
      <h2 className="text-3xl font-bold text-center text-white mb-6">
        Persona.ai
      </h2>
  
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white">
            Name:
          </label>
          <input
            type="text"
            name="name"
            autoFocus
            placeholder="Username"
            value={signupData.name}
            onChange={handleChange}
            required
            className="outline-none mt-1 w-full p-3 border border-white/30 rounded-md bg-white/10 text-white placeholder-white focus:ring-1 focus:border-transparent"
          />
        </div>
  
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white">
            Email:
          </label>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={signupData.email}
            onChange={handleChange}
            required
            className="outline-none mt-1 w-full p-3 border border-white/30 rounded-md bg-white/10 text-white placeholder-white focus:ring-1 focus:border-transparent"
          />
        </div>
  
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white">
            Password:
          </label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={signupData.password}
            onChange={handleChange}
            required
            className="outline-none mt-1 w-full p-3 border border-white/30 rounded-md bg-white/10 text-white placeholder-white focus:ring-1 focus:border-transparent"
          />
        </div>
  
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-300 shadow-lg"
        >
          Sign Up
        </button>
  
        <p className="text-sm text-white text-center mt-3">
          Already have an account?{" "}
          <a href="/login" className="text-red-300 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  </div>
  
  );
}
