"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { SearchHero } from "@/components/search-hero";
import { SearchInput } from "@/components/search-input";
import { QuestionMarquee } from "@/components/question-marquee";
import { TopicSelector } from "@/components/topic-selector";
import { ResultsStream } from "@/components/results-stream";
import { Footer } from "@/components/footer";

import { ScheduleParser } from "@/lib/schedule-parser";
import { scheduleData } from "@/data/schedule-loader"; // We'll create a loader to get text
import { SIMULATED_ANSWERS } from "@/data/simulated-answers";

export default function Home() {
  const [hasSearched, setHasSearched] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [directAnswer, setDirectAnswer] = useState<string | undefined>(undefined);

  const handleSearch = (query?: string) => {
    const effectivelyQuery = query || searchQuery;
    setHasSearched(true);
    setIsStreaming(true);
    setDirectAnswer(undefined); // Reset
    setSearchResults([]); // Reset

    // Check for simulated answer first
    if (effectivelyQuery && SIMULATED_ANSWERS[effectivelyQuery]) {
      setDirectAnswer(SIMULATED_ANSWERS[effectivelyQuery]);
      return;
    }

    // Simulate API delay slightly for effect, but do real search
    setTimeout(() => {
      const parser = new ScheduleParser(scheduleData);
      const results = parser.search(effectivelyQuery);
      setSearchResults(results);
    }, 500);
  };


  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-eitb-blue/20 selection:text-eitb-blue flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col relative pt-16">
        <div className={`transition-all duration-700 ease-in-out flex flex-col items-center w-full ${hasSearched ? "pt-8 -mb-10 scale-90 opacity-0 h-0 overflow-hidden" : "pt-12"}`}>
          <SearchHero />

          <div className="w-full my-8">
            <QuestionMarquee onQuestionClick={handleSearch} />
            <TopicSelector onSelect={handleSearch} className="mt-8" />
          </div>

          <div className="w-full px-4 mb-12">
            <SearchInput onSearch={handleSearch} />
          </div>
        </div>

        {hasSearched && (
          <div className="container mx-auto px-4 pb-20">
            <ResultsStream
              isStreaming={isStreaming}
              results={searchResults}
              directAnswer={directAnswer}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
