"use client";

import { useConversation } from "@elevenlabs/react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";

export function VoiceChat() {
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setIsConnecting(false);
    },
    onDisconnect: () => {
      console.log("Disconnected from ElevenLabs");
      setIsConnecting(false);
    },
    onMessage: (message: any) => {
      console.log("Message from ElevenLabs:", message);
    },
    onError: (error: any) => {
      console.error("ElevenLabs Error:", error);
      setIsConnecting(false);
    },
  });

  const startConversation = useCallback(async () => {
    try {
      setIsConnecting(true);
      // Solicitar permisos de micrófono explícitamente primero si es necesario
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Obtener el signed URL desde nuestra API
      const response = await fetch("/api/get-signed-url");
      const { signedUrl } = await response.json();

      if (!signedUrl) throw new Error("No signed URL received");

      await conversation.startSession({
        signedUrl,
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      setIsConnecting(false);
      alert("Error al iniciar el chat por voz. Por favor, asegúrate de dar permisos de micrófono.");
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isActive = conversation.status === "connected";
  const isBuffering = conversation.status === "connecting" || isConnecting;

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-8 animate-in fade-in duration-1000">
      <div className="relative">
        {/* Animate pulse when active or connecting */}
        {(isActive || isBuffering) && (
          <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
        )}
        
        <button
          onClick={isActive ? stopConversation : startConversation}
          disabled={isBuffering}
          className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 shadow-xl ${
            isActive 
              ? "bg-red-500 hover:bg-red-600 scale-110" 
              : "bg-[#11597a] hover:bg-[#0d455d] hover:scale-105"
          } ${isBuffering ? "opacity-80 cursor-wait" : "cursor-pointer"}`}
          aria-label={isActive ? "Detener chat por voz" : "Iniciar chat por voz"}
        >
          {isBuffering ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : isActive ? (
            <MicOff className="w-10 h-10 text-white" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </button>
      </div>

      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-[#11597a] animate-pulse">
          {isBuffering 
            ? "Conectando..." 
            : isActive 
              ? "Te escucho... puedes hablar" 
              : "Pulsa para empezar a hablar"}
        </p>
        
        {isActive && conversation.isSpeaking && (
          <div className="flex justify-center space-x-1 h-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="w-1 bg-[#11597a] rounded-full animate-bounce" 
                style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 100 + 40}%` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-xs text-center text-sm text-gray-500">
        Interactúa con nuestro asistente inteligente mediante voz para encontrar tu residencia ideal de forma natural.
      </div>
    </div>
  );
}
