"use client";

import { useState } from "react";
import Link from "next/link";
import { COMPANY_INFO } from "@/lib/constants/legal";

export default function BetaGuidePage() {
  const [lang, setLang] = useState<"en" | "es">("en");

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gradient">
            NEXO
          </Link>
          {/* Language Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
            <button
              onClick={() => setLang("en")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                lang === "en"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("es")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                lang === "es"
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              ES
            </button>
          </div>
        </div>

        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>←</span>
            <span>{lang === "en" ? "Back to NEXO" : "Volver a NEXO"}</span>
          </Link>
        </div>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          {lang === "en" ? <EnglishContent /> : <SpanishContent />}
        </article>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {COMPANY_INFO.name}</p>
          <p className="mt-1">{COMPANY_INFO.email} | trynexo.ai</p>
        </div>
      </div>
    </div>
  );
}

function EnglishContent() {
  return (
    <>
      <h1>Beta Testers Guide</h1>
      <p className="text-muted-foreground">Welcome to the NEXO Beta! Your feedback will directly shape the future of NEXO.</p>

      <section>
        <h2>What is NEXO?</h2>
        <p>
          NEXO is an AI companion platform where you can have meaningful conversations with three
          unique AI characters — Lía, Mía, and Allan. Each has their own personality, interests,
          and conversation style.
        </p>
        <p>
          <strong>Important:</strong> NEXO characters are AI companions, not real people. They are
          designed to provide thoughtful, engaging conversations — but please do not share sensitive
          personal information like passwords, financial details, or social security numbers.
        </p>
      </section>

      <section>
        <h2>Getting Started</h2>
        <h3>1. Create Your Account</h3>
        <p>
          Visit <strong>trynexo.ai</strong>, click Sign Up, enter your email and password,
          accept the Terms of Service, verify your age (18+), and complete the brief onboarding flow.
        </p>

        <h3>2. Choose an Avatar</h3>
        <p>You&apos;ll meet three AI companions:</p>
        <ul>
          <li><strong>Lía</strong> — Empathetic, creative, warm. Best for deep conversations, emotional support, and creative brainstorming.</li>
          <li><strong>Mía</strong> — Adventurous, energetic, bold. Best for fun chats, travel talk, and spontaneous conversations.</li>
          <li><strong>Allan</strong> — Thoughtful, wise, reflective. Best for philosophy, life advice, and intellectual discussions.</li>
        </ul>

        <h3>3. Choose a Relationship Type</h3>
        <p>Each conversation has a relationship mode that shapes how your avatar interacts with you:</p>
        <ul>
          <li><strong>Aliado (Assistant)</strong> — Helpful, task-oriented, supportive</li>
          <li><strong>Confidente (Friend)</strong> — Casual, warm, personal</li>
          <li><strong>Mi Persona (Romantic)</strong> — Intimate, affectionate (Premium plan, 18+ only)</li>
        </ul>

        <h3>4. Start Chatting</h3>
        <p>
          Type your message and press <strong>Enter</strong> to send. Press <strong>Shift + Enter</strong> for a new line.
          That&apos;s it — just be yourself and have a conversation.
        </p>
      </section>

      <section>
        <h2>Beta Plans</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Plus ($12.99/mo)</th>
                <th>Premium ($19.99/mo)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Messages per day</td><td>5</td><td>100</td><td>Unlimited</td></tr>
              <tr><td>Avatars</td><td>Lía only</td><td>All 3</td><td>All 3</td></tr>
              <tr><td>Relationship types</td><td>Aliado, Confidente</td><td>Aliado, Confidente</td><td>All (incl. Mi Persona)</td></tr>
              <tr><td>File attachments</td><td>—</td><td>✓</td><td>✓</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>What We Need From You</h2>
        <p>We&apos;re specifically looking for feedback on:</p>
        <ol>
          <li><strong>Conversation Quality</strong> — Do the avatars feel natural? Are responses too long, too short, or just right?</li>
          <li><strong>Personality Consistency</strong> — Does each avatar feel distinct and consistent?</li>
          <li><strong>Onboarding Experience</strong> — Was sign-up smooth? Did you understand what to do?</li>
          <li><strong>Bugs &amp; Glitches</strong> — Anything that doesn&apos;t work as expected</li>
          <li><strong>Overall Experience</strong> — Would you come back? Would you recommend NEXO to a friend?</li>
        </ol>

        <h3>How to Report Issues</h3>
        <p>
          For bugs or technical problems, email <strong>support@trynexo.ai</strong> and include:
          what happened, what you expected, your device/browser, and a screenshot if possible.
        </p>
      </section>

      <section>
        <h2>Managing Your Data</h2>
        <p>You have full control over your data:</p>
        <ul>
          <li><strong>Clear All Conversations &amp; Memory</strong> — Go to Settings → Danger Zone → Clear All Data. This permanently deletes all your conversations, messages, and memories. Your avatars will forget everything about you. Your account and subscription remain intact.</li>
          <li><strong>Delete Your Account</strong> — Go to Settings → Danger Zone → Delete Account. Your data will be permanently removed after 30 days.</li>
        </ul>
      </section>

      <section>
        <h2>Tips for the Best Experience</h2>
        <ul>
          <li>Try all available avatars — each one has a completely different personality</li>
          <li>Experiment with relationship types — the same avatar feels different as an Aliado vs. Confidente</li>
          <li>Have real conversations — ask questions, share thoughts, be curious</li>
          <li>Try different topics — creative writing, life advice, casual chat, deep philosophy</li>
          <li>Use on mobile — NEXO works great on phone browsers. Add it to your home screen for an app-like experience</li>
        </ul>
      </section>

      <section>
        <h2>Frequently Asked Questions</h2>
        <h3>Is my data private?</h3>
        <p>Yes. Your conversations are encrypted and never shared with third parties. See our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for full details.</p>

        <h3>Can I delete my data?</h3>
        <p>Yes. You can clear all conversations and memories from Settings, or delete your entire account.</p>

        <h3>Does NEXO remember our conversations?</h3>
        <p>Yes, within each conversation session. Your avatar remembers what you&apos;ve talked about and can reference earlier parts of the conversation.</p>

        <h3>Is this a real person?</h3>
        <p>No. NEXO avatars are AI-powered companions. They are not real people and you will always see a disclaimer in the chat interface.</p>

        <h3>What devices are supported?</h3>
        <p>NEXO works on any modern browser — Chrome, Safari, Firefox, Edge — on both desktop and mobile.</p>

        <h3>How do I upgrade my plan?</h3>
        <p>Go to Settings → Subscription to view and change your plan.</p>

        <h3>Who do I contact for help?</h3>
        <p>Email us at <strong>support@trynexo.ai</strong> — we typically respond within 24 hours.</p>
      </section>

      <section>
        <h2>Known Beta Limitations</h2>
        <ul>
          <li>Occasional response delays during high-traffic periods</li>
          <li>Some features are still being refined based on feedback</li>
          <li>Avatar images for different relationship types are coming soon</li>
          <li>Voice and video features are not available in this version</li>
        </ul>
      </section>

      <section>
        <h2>Thank You</h2>
        <p>
          You&apos;re helping us build something meaningful. Every conversation you have, every bug you report,
          and every piece of feedback you share makes NEXO better for everyone. Welcome to the NEXO community.
        </p>
      </section>
    </>
  );
}

function SpanishContent() {
  return (
    <>
      <h1>Guía para Beta Testers</h1>
      <p className="text-muted-foreground">¡Bienvenido al Beta de NEXO! Tu feedback dará forma directa al futuro de NEXO.</p>

      <section>
        <h2>¿Qué es NEXO?</h2>
        <p>
          NEXO es una plataforma de compañía con IA donde puedes tener conversaciones significativas con tres
          personajes únicos de IA — Lía, Mía y Allan. Cada uno tiene su propia personalidad, intereses
          y estilo de conversación.
        </p>
        <p>
          <strong>Importante:</strong> Los personajes de NEXO son compañeros de IA, no personas reales. Están
          diseñados para ofrecer conversaciones interesantes y reflexivas — pero por favor no compartas
          información personal sensible como contraseñas, datos financieros o números de seguro social.
        </p>
      </section>

      <section>
        <h2>Primeros Pasos</h2>
        <h3>1. Crea tu Cuenta</h3>
        <p>
          Visita <strong>trynexo.ai</strong>, haz clic en Registrarse, ingresa tu email y contraseña,
          acepta los Términos de Servicio, verifica tu edad (18+) y completa el breve flujo de bienvenida.
        </p>

        <h3>2. Elige un Avatar</h3>
        <p>Conocerás tres compañeros de IA:</p>
        <ul>
          <li><strong>Lía</strong> — Empática, creativa, cálida. Ideal para conversaciones profundas, apoyo emocional y lluvia de ideas creativas.</li>
          <li><strong>Mía</strong> — Aventurera, enérgica, audaz. Ideal para charlas divertidas, hablar de viajes y conversaciones espontáneas.</li>
          <li><strong>Allan</strong> — Reflexivo, sabio, contemplativo. Ideal para filosofía, consejos de vida y discusiones intelectuales.</li>
        </ul>

        <h3>3. Elige un Tipo de Relación</h3>
        <p>Cada conversación tiene un modo de relación que define cómo interactúa tu avatar contigo:</p>
        <ul>
          <li><strong>Aliado (Asistente)</strong> — Útil, orientado a tareas, solidario</li>
          <li><strong>Confidente (Amigo)</strong> — Casual, cálido, personal</li>
          <li><strong>Mi Persona (Romántico)</strong> — Íntimo, afectuoso (solo plan Premium, 18+)</li>
        </ul>

        <h3>4. Empieza a Chatear</h3>
        <p>
          Escribe tu mensaje y presiona <strong>Enter</strong> para enviar. Presiona <strong>Shift + Enter</strong> para nueva línea.
          Eso es todo — sé tú mismo y ten una conversación.
        </p>
      </section>

      <section>
        <h2>Planes Beta</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Característica</th>
                <th>Gratis</th>
                <th>Plus ($12.99/mes)</th>
                <th>Premium ($19.99/mes)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Mensajes por día</td><td>5</td><td>100</td><td>Ilimitados</td></tr>
              <tr><td>Avatares</td><td>Solo Lía</td><td>Los 3</td><td>Los 3</td></tr>
              <tr><td>Tipos de relación</td><td>Aliado, Confidente</td><td>Aliado, Confidente</td><td>Todos (incl. Mi Persona)</td></tr>
              <tr><td>Archivos adjuntos</td><td>—</td><td>✓</td><td>✓</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Lo Que Necesitamos de Ti</h2>
        <p>Buscamos específicamente feedback sobre:</p>
        <ol>
          <li><strong>Calidad de Conversación</strong> — ¿Los avatares se sienten naturales? ¿Las respuestas son muy largas, muy cortas o están bien?</li>
          <li><strong>Consistencia de Personalidad</strong> — ¿Cada avatar se siente distinto y consistente?</li>
          <li><strong>Experiencia de Registro</strong> — ¿Fue fluido? ¿Entendiste qué hacer?</li>
          <li><strong>Bugs y Errores</strong> — Cualquier cosa que no funcione como esperabas</li>
          <li><strong>Experiencia General</strong> — ¿Volverías? ¿Recomendarías NEXO a un amigo?</li>
        </ol>

        <h3>Cómo Reportar Problemas</h3>
        <p>
          Para bugs o problemas técnicos, escribe a <strong>support@trynexo.ai</strong> e incluye:
          qué pasó, qué esperabas, tu dispositivo/navegador, y un screenshot si es posible.
        </p>
      </section>

      <section>
        <h2>Gestión de tus Datos</h2>
        <p>Tienes control total sobre tus datos:</p>
        <ul>
          <li><strong>Borrar Todas las Conversaciones y Memoria</strong> — Ve a Configuración → Zona de Peligro → Borrar Todo. Esto elimina permanentemente todas tus conversaciones, mensajes y memorias. Tus avatares olvidarán todo sobre ti. Tu cuenta y suscripción se mantienen intactas.</li>
          <li><strong>Eliminar tu Cuenta</strong> — Ve a Configuración → Zona de Peligro → Eliminar Cuenta. Tus datos se eliminarán permanentemente después de 30 días.</li>
        </ul>
      </section>

      <section>
        <h2>Tips para la Mejor Experiencia</h2>
        <ul>
          <li>Prueba todos los avatares disponibles — cada uno tiene una personalidad completamente diferente</li>
          <li>Experimenta con los tipos de relación — el mismo avatar se siente diferente como Aliado vs. Confidente</li>
          <li>Ten conversaciones reales — haz preguntas, comparte pensamientos, sé curioso</li>
          <li>Prueba diferentes temas — escritura creativa, consejos de vida, charla casual, filosofía profunda</li>
          <li>Usa en el celular — NEXO funciona excelente en navegadores móviles. Agrégalo a tu pantalla de inicio para una experiencia tipo app</li>
        </ul>
      </section>

      <section>
        <h2>Preguntas Frecuentes</h2>
        <h3>¿Mis datos son privados?</h3>
        <p>Sí. Tus conversaciones están encriptadas y nunca se comparten con terceros. Consulta nuestra <Link href="/privacy" className="text-primary hover:underline">Política de Privacidad</Link> para más detalles.</p>

        <h3>¿Puedo borrar mis datos?</h3>
        <p>Sí. Puedes borrar todas las conversaciones y memorias desde Configuración, o eliminar tu cuenta completa.</p>

        <h3>¿NEXO recuerda nuestras conversaciones?</h3>
        <p>Sí, dentro de cada sesión de conversación. Tu avatar recuerda lo que han hablado y puede hacer referencia a partes anteriores de la conversación.</p>

        <h3>¿Es una persona real?</h3>
        <p>No. Los avatares de NEXO son compañeros impulsados por IA. No son personas reales y siempre verás un aviso en la interfaz de chat.</p>

        <h3>¿Qué dispositivos son compatibles?</h3>
        <p>NEXO funciona en cualquier navegador moderno — Chrome, Safari, Firefox, Edge — tanto en escritorio como en móvil.</p>

        <h3>¿Cómo actualizo mi plan?</h3>
        <p>Ve a Configuración → Suscripción para ver y cambiar tu plan.</p>

        <h3>¿A quién contacto para ayuda?</h3>
        <p>Escríbenos a <strong>support@trynexo.ai</strong> — normalmente respondemos en menos de 24 horas.</p>
      </section>

      <section>
        <h2>Limitaciones Conocidas del Beta</h2>
        <ul>
          <li>Posibles retrasos en respuestas durante períodos de alto tráfico</li>
          <li>Algunas funciones aún se están refinando basándose en el feedback</li>
          <li>Imágenes de avatar por tipo de relación próximamente</li>
          <li>Las funciones de voz y video no están disponibles en esta versión</li>
        </ul>
      </section>

      <section>
        <h2>Gracias</h2>
        <p>
          Estás ayudando a construir algo significativo. Cada conversación que tienes, cada bug que reportas
          y cada pieza de feedback que compartes hace que NEXO sea mejor para todos. Bienvenido a la comunidad NEXO.
        </p>
      </section>
    </>
  );
}
