// lib/hooks/useMessageSound.ts
// Hook para reproducir sonido sutil cuando llega mensaje del avatar

"use client";

import { useCallback, useRef } from "react";

export function useMessageSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playMessageSound = useCallback(() => {
    try {
      // Crear AudioContext solo cuando se necesita (evita warning de autoplay)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      
      // Crear oscilador para tono suave
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Configurar tono suave y agradable (tipo campana)
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime); // Frecuencia inicial
      oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1); // Baja suavemente

      // Configurar volumen (muy sutil)
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime); // Volumen bajo
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3); // Fade out

      // Conectar nodos
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Reproducir
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3); // Duración: 300ms

    } catch (error) {
      // Silenciosamente fallar si el audio no está disponible
      console.debug("[Sound] Could not play message sound:", error);
    }
  }, []);

  return { playMessageSound };
}

