"use client";

import { motion } from "framer-motion";

export default function Main() {
  return (
    <main className="pt-26 pb-32 px-6 md:px-20 bg-white text-gray-800">
   
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-bold font-mono mb-4">
          Explore persona.ai
        </h1>
        <p className="text-lg text-gray-600">
          Created by Anas, persona.ai brings customizable AI characters to life with rich conversations and immersive interactions.
        </p>
      </motion.div>

      {[
        {
          title: "Meet the Built-In Characters",
          description:
            "Start chatting instantly with a variety of pre-built personas — from warriors and healers to futuristic technomancers.",
          screenshot: "/main.png",
        },
          {
          title: "Character Interaction",
          description:
            "Each persona interacts differently, remembers your choices, and adapts its behavior for a realistic experience.",
          screenshot: "/interaction.png",
        },
                {
          title: "Voice Calling with AI",
          description:
            "Talk to your AI characters in real-time using voice. Natural replies and speech recognition make conversations fluid.",
          screenshot: "/call.png",
        },
        {
        title: "Create Your Own Character",
        description:
            "Bring your imagination to life by building unique AI personas. Customize names, voices, appearances, and personality traits to make the perfect companion for any scenario.",
        screenshot: "/create.png",
        },

       {
          title: "Create Your Own Persona",
          description:
            "Define your own AI persona with a custom identity, style, and behavior—tailored to how you want it to represent you.",
          screenshot: "/persona.png",
        },

        {
          title: "Switch Personas Mid-Chat",
          description:
            "Easily switch between your personalized AI personas in a conversation—each with its own memory, tone, and context.",
          screenshot: "/switch.png",
        }


     ].map((section, i) => (
        <motion.section
          key={i}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.2 }}
          viewport={{ once: true }}
          className="mt-24 grid md:grid-cols-2 gap-10 items-center"
        >
          {/* Image */}
          <div className={`order-${i % 2 === 0 ? "1" : "2"} md:order-1`}>
            <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400">
             <img src={section.screenshot} alt="Predefined Characters" className="object-cover w-full h-full" />

            </div>
          </div>

          {/* Text */}
          <div className={`order-${i % 2 === 0 ? "2" : "1"} md:order-2`}>
            <h2 className="text-2xl font-bold mb-3">{section.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{section.description}</p>
          </div>
        </motion.section>
      ))}

      {/* Ending Note */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: true }}
        className="text-center mt-32 max-w-xl mx-auto"
      >
        <h3 className="text-xl font-semibold font-mono mb-2">One Developer. Infinite Possibilities.</h3>
        <p className="text-gray-500 text-sm">
          persona.ai is an experimental project crafted with care by Anas to push the boundaries of conversational AI. More features coming soon.
        </p>
      </motion.div>
    </main>
  );
}


