//Componente del chat entre comprador y artesano.

"use client"; //Se renderiza en el cliente.

import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatTime } from "~/lib/date";

//se define el objeto MessageWithSender con los atributos que contiene de cada mensaje de los participantes.
export type MessageWithSender = {
  id: string;
  content: string;
  imageUrl?: string | null;
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

//Función principal del componente de enviar mensajes entre artesano y comprador
export default function MessageArea({ conversationId, userId, currentUser, initialMessages }: Props) {
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  //hasMore indica si hay mensajes anteriores que cargar. Se inicializa a true si llegaron exactamente 30 mensajes (puede haber más).
  const [hasMore, setHasMore] = useState(initialMessages.length === 30);
  const [loadingMore, setLoadingMore] = useState(false);

  //Referencia para acceder al último mensaje dentro del setInterval sin problemas de closures
  const messagesRef = useRef(messages); //useRef() crea una referencia directa al objeto messages con el valor inicial, por lo que ve lo que hay dentro del objeto y los cambios en tiempo real para evitar stale closures (closures obsoletas).
  useEffect(() => { messagesRef.current = messages; }, [messages]); //Cada vez que messages cambia (que existe un nuevo mensaje), actualiza el valor actual.

  //Referencia al input de archivo oculto para adjuntar imágenes
  const fileInputRef = useRef<HTMLInputElement>(null);

  //Referencia al contenedor de scroll para preservar la posición al cargar mensajes anteriores
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  //Scroll automático al último mensaje cuando llegan mensajes nuevos (no al cargar anteriores)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  //Polling + Page Visibility API
  useEffect(() => {

    //Se establece el intervalo de tiempo en el que se va a volver a realizar la comprobación de nuevos mensajes.
    let intervalId: ReturnType<typeof setInterval> | null = null;

    //Función para cargar nuevos mensajes. Si hay mensajes, solicita solo los nuevos desde el último (parámetro since). Si la conversación está vacía, hace una petición sin since para recibir el primer mensaje entrante.
    async function poll() {
      const last = messagesRef.current.at(-1);
      const query = last
        ? `?since=${encodeURIComponent(new Date(last.createdAt).toISOString())}`
        : "";
      try {
        const res = await fetch(`/api/messages/${conversationId}${query}`);
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

    //Función para iniciar la función de polling
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

  //Función para cargar mensajes anteriores al primero visible. Preserva la posición de scroll para no saltar al inicio.
  async function loadMore() {
    if (!hasMore || loadingMore) return;
    const oldest = messages[0];
    if (!oldest) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/messages/${conversationId}?before=${encodeURIComponent(new Date(oldest.createdAt).toISOString())}`,
      );
      if (!res.ok) return;
      const { data, hasMore: more } = (await res.json()) as { data: MessageWithSender[]; hasMore: boolean };
      if (data.length === 0) { setHasMore(false); return; }

      //Guardamos la altura actual del contenedor antes de insertar para restaurar el scroll después
      const container = scrollContainerRef.current;
      const prevScrollHeight = container?.scrollHeight ?? 0;

      setMessages((prev) => [...data, ...prev]);
      setHasMore(more);

      //requestAnimationFrame espera a que React haya renderizado los nuevos mensajes antes de ajustar el scroll
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop += container.scrollHeight - prevScrollHeight;
        }
      });
    } catch {
      toast.error("No se pudieron cargar los mensajes anteriores.");
    } finally {
      setLoadingMore(false);
    }
  }

  //Función para enviar mensajes. Acepta texto, imagen, o ambos.
  async function sendMessage(content: string, imageUrl?: string) {

    //Se define un id temporal con la fecha y la hora de envío del mensaje
    const tempId = `temp-${Date.now()}`;

    //Se define un mensaje temporal del tipo MessageWithSender con los atributos correspondientes.
    const tempMsg: MessageWithSender = {
      id: tempId,
      content,
      imageUrl: imageUrl ?? null,
      senderId: userId,
      createdAt: new Date().toISOString(),
      sender: currentUser,
      status: "sending",
    };

    //Se añade el nuevo mensaje temporal a los mensajes previos
    setMessages((prev) => [...prev, tempMsg]);

    //Se modifica esta variable a true para indicar que se esta procediendo al envío del mensaje
    setSending(true);

    //Se envía el nuevo mensaje. Si se envía el mensaje, se guarda junto con los mensajes previos sino se muestra el error correspondiente.
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content || "", ...(imageUrl ? { imageUrl } : {}) }),
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
      e.preventDefault(); //Evita que se añada un salto de línea
      const content = input.trim();
      if (!content || sending) return;
      setInput("");
      void sendMessage(content);
    }
  }

  //Evento para reintentar el envío de un mensaje previo que no se ha enviado.
  function handleRetry(msg: MessageWithSender) {
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    void sendMessage(msg.content, msg.imageUrl ?? undefined);
  }

  //Función para gestionar la selección de una imagen. Valida tipo y tamaño en cliente, la sube a Cloudinary vía /api/upload y envía el mensaje con la URL resultante.
  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!e.target) return;
    // Limpiar el input para que el mismo archivo pueda seleccionarse de nuevo si fuera necesario
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("La imagen no puede superar 10 MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "message");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        toast.error("No se pudo subir la imagen. Inténtalo de nuevo.");
        return;
      }
      const { data } = (await res.json()) as { data: { url: string } };
      void sendMessage("", data.url);
    } catch {
      toast.error("No se pudo subir la imagen. Inténtalo de nuevo.");
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <>
      {/* Lista de mensajes */}
      <div ref={scrollContainerRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">

        {/* Botón para cargar mensajes anteriores */}
        {hasMore && (
          <div className="mb-3 flex justify-center">
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-[--border] bg-[--bg] px-3 py-1.5 text-xs text-[--text-muted] transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore ? <Loader2 size={12} className="animate-spin" /> : null}
              {loadingMore ? "Cargando..." : "Cargar mensajes anteriores"}
            </button>
          </div>
        )}

        {messages.length === 0 && (
          <p className="text-center text-xs text-[--text-muted]">
            Escribe el primer mensaje para iniciar la conversación
          </p>
        )}

        <ol className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isOwn = msg.senderId === userId;
            return (
              <li key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
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
                        {msg.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={msg.imageUrl}
                            alt={`Imagen enviada por ${msg.sender.name ?? "usuario"}`}
                            className="mb-1 max-h-48 max-w-full rounded-lg object-cover"
                          />
                        )}
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[75vw] rounded-2xl px-4 py-2 text-sm md:max-w-sm ${
                        isOwn
                          ? "rounded-br-sm bg-[#3d5a4f] text-white"
                          : "rounded-bl-sm bg-[#3d5a4f]/55 text-white"
                      } ${msg.status === "sending" ? "opacity-60" : ""}`}
                    >
                      {/* Imagen del mensaje — clicable para abrir en tamaño completo */}
                      {msg.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={msg.imageUrl}
                          alt={`Imagen enviada por ${msg.sender.name ?? "usuario"}`}
                          className={`max-h-48 max-w-full cursor-pointer rounded-lg object-cover ${msg.content ? "mb-1" : ""}`}
                          onClick={() => window.open(msg.imageUrl ?? undefined, "_blank")}
                        />
                      )}
                      {msg.content && <p>{msg.content}</p>}
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
      <div className="shrink-0 border-t border-[--border] bg-[--bg] px-4 py-3">
        {/* Input de archivo oculto para adjuntar imágenes */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          aria-label="Adjuntar imagen"
          className="hidden"
          onChange={(e) => void handleImageSelect(e)}
        />
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Botón para adjuntar imagen */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage || sending}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[--text-muted] transition-colors hover:bg-black/10 hover:text-[--text] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Adjuntar imagen"
          >
            {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            disabled={sending || uploadingImage}
            className="flex-1 resize-none rounded-2xl border border-[--border] bg-[--surface] px-4 py-2.5 text-sm text-[--text] placeholder:text-[--text-muted] focus:outline-none focus:ring-1 focus:ring-[#3d5a4f] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending || uploadingImage}
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
