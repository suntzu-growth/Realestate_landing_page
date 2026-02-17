"use client";

import { Header } from "@/components/header";
import { SearchHero } from "@/components/search-hero";
import { VoiceChat } from "@/components/voice-chat";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Header />
      <main className="flex-1 pt-12 md:pt-16 flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center px-6">
          <SearchHero />
          <div className="w-full mt-4 md:mt-8">
            <VoiceChat />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
