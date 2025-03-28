"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
const baseURL = "http://localhost:3000";


export default function LoginPage(){
 
    const [loginInfo, setloginInfo] = useState({ email: "", password: "" });
    const router = useRouter();
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setloginInfo((prev) => ({ ...prev, [name]: value }));
    };
 
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
          return alert("Email, and Password are required!");
        }
    
        try {
          const url = `${baseURL}/api/login`;
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(loginInfo),
          });
          const result = await response.json();
          const {success,message,error}=result;
    
          if (success) {
            alert(message);
            setTimeout(() => {
                router.push("/"); 
              }, 1000);
          } else if(error) {
            const details= error?.details[0].message;
            console.log(details);
          }
        } catch (err) {
          console.log(err);
        }
      };

    return (
<div className="flex items-center justify-center min-h-screen h-screen w-full bg-[url('/ai-bg.webp')] bg-cover bg-center bg-no-repeat">
  <div className="bg-white/20 backdrop-blur-lg p-8 shadow-xl rounded-xl max-w-sm w-full border border-white/30">
    <h2 className="text-3xl font-bold text-center text-white mb-6 tracking-wide">
      Persona.ai
    </h2>

    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email:
        </label>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={loginInfo.email}
          onChange={handleChange}
          required
          className="outline-none mt-1 w-full p-3 border border-white/30 rounded-md bg-white/10 text-white placeholder-white focus:ring-1  focus:border-transparent"
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
          value={loginInfo.password}
          onChange={handleChange}
          required
          className="outline-none mt-1 w-full p-3 border border-white/30 rounded-md bg-white/10 text-white placeholder-white focus:ring-1  focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-300 shadow-lg"
      >
        Login
      </button>

      <p className="text-sm text-white text-center mt-3">
        Don't have an account?{" "}
        <a href="/signup" className="text-red-300 hover:underline">
          Sign up
        </a>
      </p>
    </form>
  </div>
</div>


    )
};