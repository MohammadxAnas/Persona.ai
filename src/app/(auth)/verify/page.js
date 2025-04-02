"use client";
import React, { useEffect, useState } from "react";
import { baseURL } from "@/app/utlils/const";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function VerificationPage() {
    const [confCode, setConfCode] = useState({ code: "" });
    const [userEmail, setUserEmail] = useState("");
    const router = useRouter();

    useEffect(() => {
        const storedEmail = localStorage.getItem("userEmail");
        if (!storedEmail) {
            router.push("/login");
        } else {
            setUserEmail(storedEmail);
        }
    }, []); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfCode((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!confCode.code) {
            return console.log("Confirmation code required!");
        }

        try {
            const data = { email: userEmail, code: confCode.code };
            const userData = JSON.parse(localStorage.getItem("userData"));
            console.log("userData:",userData);
            const response = await fetch(`${baseURL}/api/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({...data, ...userData}),
            });

            const result = await response.json();
            const { success, message } = result;

            if (success) {
              
                localStorage.removeItem("userEmail");
                localStorage.removeItem("userData");
                setTimeout(() => {
                    router.push("/login");
                }, 1000);
                return   toast(message);
            } else {
                toast("Invalid confirmation code!");
            }
        } catch (error) {
            console.error("Verification Error:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center" 
            style={{ backgroundImage: "url('/ai-bg.webp')" }} // Update path if needed
        >
            <div className="bg-white/20 backdrop-blur-md p-8 rounded-lg shadow-lg w-96 text-center">
                <h3 className="text-2xl font-semibold text-white mb-4">Enter Confirmation Code</h3>
                <p className="text-white/80 text-sm mb-4">
                    Enter the 6-digit code sent to <br />
                    <i className="font-semibold">{userEmail}</i>.{" "}
                    <b className="text-blue-300 cursor-pointer hover:underline">
                        Request a new one.
                    </b>
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="code"
                        placeholder="Confirmation Code"
                        value={confCode.code}
                        onChange={handleChange}
                        required
                        className="w-full p-3 rounded-md bg-white/10 border border-white/30 text-white placeholder-white/50 outline-none"
                    />
                    <button 
                        type="submit" 
                        className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
                    >
                        Next
                    </button>
                </form>
                <div className="mt-4 text-white/80 text-sm">
                    <Link href="/signup" className="hover:underline">
                        Go back
                    </Link>
                    <span className="mx-2">•</span>
                    <Link href="/login" className="hover:underline">
                        Have an account? Log in
                    </Link>
                </div>
            </div>
        </div>
    );
}
