import { useEffect, useRef, useState } from "react";
import { ImagePlus, Mic, Send, X, Play, Pause, Trash2 } from "lucide-react";
import Field from "../components/Field";

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds || 0));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatNow() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const MESSAGE_TYPES = [
  { id: "text", label: "Texto" },
  { id: "image", label: "Imagem" },
  { id: "audio", label: "Áudio" },
];

/* ---------------------------------------------------------
   Audio player (usado no preview e no histórico)
--------------------------------------------------------- */

function AudioPlayer({ duration = 0, audioUrl }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const audioRef = useRef(null);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying((p) => !p);
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setElapsed(audio.currentTime);
    setProgress(audio.currentTime / audio.duration);
  }

  function handleEnded() {
    setPlaying(false);
    setProgress(0);
    setElapsed(0);
  }

  return (
    <div className="flex min-w-[220px] items-center gap-3 rounded-xl bg-zinc-100 px-4 py-3">
      <button
        type="button"
        onClick={togglePlay}
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-zinc-950 text-white transition-colors hover:cursor-pointer hover:bg-zinc-800"
        aria-label={playing ? "Pausar áudio" : "Reproduzir áudio"}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="h-1 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-zinc-950 transition-[width]"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          />
        </div>
        <div className="mt-1.5 font-satoshi text-[11px] text-zinc-400">
          {playing ? formatDuration(elapsed) : formatDuration(duration)}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
    </div>
  );
}

/* ---------------------------------------------------------
   Item do histórico de envios
--------------------------------------------------------- */

function SentItem({ item }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-black/10 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="font-satoshi text-xs text-zinc-400">
          Para {item.recipient} · {item.time}
        </p>

        <div className="mt-2">
          {item.type === "text" && (
            <p className="whitespace-pre-wrap break-words font-satoshi text-sm leading-relaxed text-zinc-950">
              {item.text}
            </p>
          )}

          {item.type === "image" && (
            <div className="overflow-hidden rounded-xl border border-black/5">
              <img src={item.imageUrl} alt="Imagem enviada" className="max-h-56 w-full object-cover" />
              {item.caption && (
                <p className="px-3 py-2 font-satoshi text-sm text-zinc-950">{item.caption}</p>
              )}
            </div>
          )}

          {item.type === "audio" && <AudioPlayer duration={item.duration} audioUrl={item.audioUrl} />}
        </div>
      </div>

      <span className="flex-shrink-0 rounded-lg bg-zinc-100 px-2.5 py-1 font-satoshi text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
        Enviado
      </span>
    </div>
  );
}

/* ---------------------------------------------------------
   Página de envio
--------------------------------------------------------- */

function ChatPage() {
  const [recipient, setRecipient] = useState("");
  const [activeType, setActiveType] = useState("text");
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sending, setSending] = useState(false);
  const [sentMessages, setSentMessages] = useState([]);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
  }, [text]);

  useEffect(() => {
    return () => {
      clearInterval(recordingIntervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage({ file, previewUrl: URL.createObjectURL(file) });
    e.target.value = "";
  }

  async function startRecording() {
    setIsRecording(true);
    setRecordingTime(0);
    setRecordedAudio(null);
    recordingIntervalRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch (err) {
      // Sem acesso ao microfone: mantém a gravação simulada (sem áudio real) para demonstração.
      console.error("Não foi possível acessar o microfone:", err);
      mediaRecorderRef.current = null;
    }
  }

  function cancelRecording() {
    clearInterval(recordingIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingTime(0);
  }

  function finishRecording() {
    clearInterval(recordingIntervalRef.current);
    const duration = recordingTime;

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedAudio({ audioUrl: url, duration: Math.max(duration, 1) });
      };
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    } else {
      setRecordedAudio({ audioUrl: null, duration: Math.max(duration, 1) });
    }

    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordingTime(0);
  }

  function resetComposer() {
    setText("");
    setSelectedImage(null);
    setRecordedAudio(null);
  }

  function canSend() {
    if (!recipient.trim()) return false;
    if (activeType === "text") return text.trim().length > 0;
    if (activeType === "image") return Boolean(selectedImage);
    if (activeType === "audio") return Boolean(recordedAudio);
    return false;
  }

  async function handleSend() {
    if (!canSend() || sending) return;
    setSending(true);

    // TODO: integrar aqui com o endpoint de envio da instância
    // (ex.: Z-API send-text / send-image / send-video), usando
    // as credenciais salvas na página de conexão da instância.
    await new Promise((resolve) => setTimeout(resolve, 600));

    const base = { id: Date.now(), recipient: recipient.trim(), time: formatNow() };

    if (activeType === "text") {
      setSentMessages((prev) => [{ ...base, type: "text", text: text.trim() }, ...prev]);
    } else if (activeType === "image") {
      setSentMessages((prev) => [
        { ...base, type: "image", imageUrl: selectedImage.previewUrl, caption: text.trim() || undefined },
        ...prev,
      ]);
    } else if (activeType === "audio") {
      setSentMessages((prev) => [
        { ...base, type: "audio", audioUrl: recordedAudio.audioUrl, duration: recordedAudio.duration },
        ...prev,
      ]);
    }

    resetComposer();
    setSending(false);
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px w-10 bg-black/20" />
        <span className="font-satoshi text-xs font-semibold uppercase tracking-[0.25em] text-black/40">
          Messaging
        </span>
      </div>

      <h1 className="font-satoshi text-4xl font-semibold leading-[0.95] tracking-[-0.055em] text-zinc-950 sm:text-5xl md:text-6xl">
        Enviar <span className="text-zinc-400">Mensagem</span>
      </h1>

      <p className="mt-5 max-w-lg font-satoshi text-base leading-relaxed text-zinc-500">
        Envie mensagens de texto, imagem ou áudio para o número informado.
      </p>

      <div className="mt-10 max-w-lg space-y-5">
        <Field
          label="Número do destinatário"
          placeholder="5511999999999"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />

        {/* Seletor de tipo de mensagem */}
        <div className="flex gap-2">
          {MESSAGE_TYPES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setActiveType(option.id);
                resetComposer();
              }}
              className={`flex-1 rounded-xl border px-4 py-2.5 font-satoshi text-sm font-semibold transition-colors hover:cursor-pointer ${
                activeType === option.id
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-black/10 text-zinc-500 hover:border-zinc-950 hover:text-zinc-950"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Composer por tipo */}
        {activeType === "text" && (
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva sua mensagem..."
            className="max-h-[160px] w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 font-satoshi text-sm leading-relaxed text-zinc-950 placeholder:text-zinc-400 transition-colors focus:border-zinc-950 focus:outline-none"
          />
        )}

        {activeType === "image" && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {selectedImage ? (
              <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-zinc-50 p-3">
                <img
                  src={selectedImage.previewUrl}
                  alt="Prévia da imagem selecionada"
                  className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1 truncate font-satoshi text-sm text-zinc-500">
                  {selectedImage.file.name}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:cursor-pointer hover:text-zinc-700"
                  aria-label="Cancelar imagem"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-black/20 px-4 py-6 font-satoshi text-sm text-zinc-500 transition-colors hover:cursor-pointer hover:border-zinc-950 hover:text-zinc-950"
              >
                <ImagePlus size={18} />
                Selecionar imagem
              </button>
            )}

            {selectedImage && (
              <textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Legenda (opcional)"
                className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 font-satoshi text-sm leading-relaxed text-zinc-950 placeholder:text-zinc-400 transition-colors focus:border-zinc-950 focus:outline-none"
              />
            )}
          </div>
        )}

        {activeType === "audio" && (
          <div className="space-y-3">
            {isRecording ? (
              <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-zinc-50 px-4 py-3">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:cursor-pointer hover:text-zinc-700"
                  aria-label="Cancelar gravação"
                >
                  <Trash2 size={18} />
                </button>
                <span className="h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-red-500" />
                <span className="flex-1 font-satoshi text-sm text-zinc-500">
                  Gravando · {formatDuration(recordingTime)}
                </span>
                <button
                  type="button"
                  onClick={finishRecording}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white transition-colors hover:cursor-pointer hover:bg-zinc-800"
                  aria-label="Concluir gravação"
                >
                  <Send size={15} />
                </button>
              </div>
            ) : recordedAudio ? (
              <div className="flex items-center gap-3">
                <AudioPlayer duration={recordedAudio.duration} audioUrl={recordedAudio.audioUrl} />
                <button
                  type="button"
                  onClick={() => setRecordedAudio(null)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:cursor-pointer hover:text-zinc-700"
                  aria-label="Descartar gravação"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-black/20 px-4 py-6 font-satoshi text-sm text-zinc-500 transition-colors hover:cursor-pointer hover:border-zinc-950 hover:text-zinc-950"
              >
                <Mic size={18} />
                Gravar áudio
              </button>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend() || sending}
          className="mt-4 w-full rounded-xl bg-zinc-950 px-6 py-3.5 font-satoshi text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:cursor-pointer hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? "Enviando..." : "Enviar mensagem"}
        </button>
      </div>

      {/* Histórico de envios */}
      {sentMessages.length > 0 && (
        <div className="mt-12 max-w-lg">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-10 bg-black/20" />
            <span className="font-satoshi text-xs font-semibold uppercase tracking-[0.25em] text-black/40">
              Histórico
            </span>
          </div>

          <div className="space-y-3">
            {sentMessages.map((item) => (
              <SentItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
