//Componente del chat entre comprador y artesano.

"use client"; //Se renderiza en el cliente.

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import PaletteAvatar from "~/components/PaletteAvatar";

//se define el objeto MessageWIthSender con los atributos que contiene de cada mensaje de los participantes.
export type MessageWithSender = {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date | string;
  sender: { id: string; name: string | null; image: string | null };
  status?: "sending" | "error";
};

//Argumentos que recibe el componente de la conversación
interface Props {
  conversationId: string;
  userId: string;
  currentUser: { id: string; name: string | null; image: string | null };
  initialMessages: MessageWithSender[];
}

//Función para formatear fecha y hora.
function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

//Función principal del componente de enviar mensajes entre artesano y comprador
export default function MessageArea({ conversationId, userId, currentUser, initialMessages }: Props) {
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  //Referencia para acceder al último mensaje dentro del setInterval sin problemas de closures
  const messagesRef = useRef(messages); //useRef() crea una referencia directa al objeto messages con el valor inicial, por lo que ve lo que hay dentro del objeto y los cambios en tiempo real para evitar stale closures (closures obsoletas).
  useEffect(() => { messagesRef.current = messages; }, [messages]); //Cada vez que messages cambia (que existe un nuevo mensaje), actualiza el valor actual.

  const bottomRef = useRef<HTMLDivElement>(null);

  //Scroll automático al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //Polling + Page Visibility API
  useEffect(() => {

    //Se establece el intervalo de tiempo en el que se va a volver a realizar la comprobación de nuevos mensajes.
    let intervalId: ReturnType<typeof setInterval> | null = null;

    //Función para cargar nuevos mensajes. COmprueba si hay mensajes nuevos; si no los hay no hace nada, sino comprueba mediante la API en la base de datos los mensajes nuevos estableciendo el parámetro since en el último createdAt. Si no hay respuesta no hace nada, sino guarda el objeto MessageWithSender en el array de objetos y lo añade al array de mensajes con los mensajes previos.
    async function poll() {
      const last = messagesRef.current.at(-1);
      if (!last) return;
      try {
        const res = await fetch(
          `/api/messages/${conversationId}?since=${encodeURIComponent(new Date(last.createdAt).toISOString())}`,
        );
        if (!res.ok) return;
        const { data } = (await res.json()) as { data: MessageWithSender[] };
        if (data.length > 0) {
          setMessages((prev) => {
            // Evitar duplicados si el polling coincide con un mensaje propio recién enviado
            const existingIds = new Set(prev.map((m) => m.id));
            return [...prev, ...data.filter((m) => !existingIds.has(m.id))];
          });
        }
      } catch {
        // Error de red silencioso — no interrumpir la UX
      }
    }

    //Función para iniciar al función de polling
    function startPolling() {
      intervalId = setInterval(() => void poll(), 5000); //Se establece el intervalo de tiempo en 5000 ms.
    }

    //Función para manejar la visibilidad. Si no se abre la conversación se limpia el intervalo para realizar el polling, sino se llama a la función que lo inicia.
    function handleVisibilityChange() {
      if (document.hidden) {
        if (intervalId) clearInterval(intervalId);
        intervalId = null;
      } else {
        startPolling();
      }
    }

    //Se inicia el polling y se añade el evento para manejar la visibilidad que limpiará el intervalo o iniciará de nuevo el polling.
    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [conversationId]);

  //Función para enviar mensajes
  async function sendMessage(content: string) {

    //Se define un id temporal con la fecha y la hora de envío del mensaje
    const tempId = `temp-${Date.now()}`;

    //Se define un mensaje temporal del tipo MessageWithSender con los atributos correspondientes.
    const tempMsg: MessageWithSender = {
      id: tempId,
      content,
      senderId: userId,
      createdAt: new Date().toISOString(),
      sender: currentUser,
      status: "sending",
    };

    //Se añade el nuevo mensaje temporal a los mensajes previos
    setMessages((prev) => [...prev, tempMsg]);

    //Se modifica esta variable a true para indicar que se esta procediendo al envío del mensaje
    setSending(true);

    //Se envia el nuevo mensaje. Si se envía el mensaje, se guarda junto con los mensajes previos sino se muestra el error correspondiente. De todas formas, se establece la variable de envío como false al finalizar el envío sea cual sea el resultado.
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const { data: realMsg } = (await res.json()) as { data: MessageWithSender };
        setMessages((prev) => prev.map((m) => (m.id === tempId ? realMsg : m)));
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: "error" } : m)),
        );
        toast.error("No se pudo enviar el mensaje. Inténtalo de nuevo.");
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "error" } : m)),
      );
      toast.error("No se pudo enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  //Evento para que cuando se pulsa el botón de envío (envío de formulario), se obtenga el contenido sin espacios al principio y al final, se limpie el input y se envíe el mensaje.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    void sendMessage(content);
  }

  //Evento para que cuando se pulse Enter (y no se pulse SHIFT + Enter, que sería salto de línea) se obtenga el contenido del mensaje sin espacios al principio y al final, se limpie el input y se envíe el mensaje.
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); //Evita que se añada un salto de linea
      const content = input.trim();
      if (!content || sending) return;
      setInput("");
      void sendMessage(content);
    }
  }

  //Evento para reintentar el envío de un mensaje previo que no se ha enviado.
  function handleRetry(msg: MessageWithSender) {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    void sendMessage(msg.content);
  }

  return (
    <>
      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-xs text-[--text-muted]">
            Escribe el primer mensaje para iniciar la conversación
          </p>
        )}
        <ol className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isOwn = msg.senderId === userId;
            return (
              <li key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} items-end gap-2`}>
                {!isOwn && (
                  <PaletteAvatar
                    src={msg.sender.image}
                    name={msg.sender.name}
                    className="h-7 w-7 shrink-0"
                    fillColor="#4a9e8c"
                  />
                )}
                <div className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
                  {msg.status === "error" ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRetry(msg)}
                        className="cursor-pointer text-xs text-red-500 underline"
                      >
                        Reintentar
                      </button>
                      <div className="max-w-[75vw] rounded-2xl rounded-br-sm border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 opacity-70 md:max-w-sm">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[75vw] rounded-2xl px-4 py-2 text-sm md:max-w-sm ${
                        isOwn
                          ? "rounded-br-sm bg-[#3d5a4f] text-white"
                          : "rounded-bl-sm bg-[--surface] text-[--text]"
                      } ${msg.status === "sending" ? "opacity-60" : ""}`}
                    >
                      {msg.content}
                    </div>
                  )}
                  <time
                    dateTime={new Date(msg.createdAt).toISOString()}
                    className="text-[10px] text-[--text-muted]"
                  >
                    {formatTime(msg.createdAt)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
        <div ref={bottomRef} />
      </div>

      {/* Input de envío */}
      <div className="sticky bottom-0 border-t border-[--border] bg-[--bg] px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje... (Enter para enviar)"
            rows={1}
            disabled={sending}
            className="flex-1 resize-none rounded-2xl border border-[--border] bg-[--surface] px-4 py-2.5 text-sm text-[--text] placeholder:text-[--text-muted] focus:outline-none focus:ring-1 focus:ring-[#3d5a4f] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#3d5a4f] text-white transition-colors hover:bg-[#4a6b5e] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Enviar mensaje"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
