"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function PWAUpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const t = useTranslations("pwa");

  useEffect(() => {
    // Solo ejecutar en cliente y en producción
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        setRegistration(reg);

        // Detectar actualizaciones
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              setShowUpdate(true);
            }
          });
        });

        // Verificar si ya hay una actualización esperando
        if (reg.waiting && navigator.serviceWorker.controller) {
          setShowUpdate(true);
        }

        // Escuchar mensaje de controllerchange para recargar
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("Service Worker registration error:", error);
      }
    };

    handleServiceWorker();
  }, []);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Enviar mensaje al SW para que tome control
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-card rounded-lg shadow-lg border border-border p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              {t("updateAvailable")}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t("updateDescription")}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpdate}
                className="px-3 py-1.5 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-md transition-colors"
              >
                {t("updateNow")}
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-md transition-colors"
              >
                {t("later")}
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

