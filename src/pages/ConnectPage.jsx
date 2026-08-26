import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Field from "../components/Field";

function ConnectPage() {
  const [form, setForm] = useState({ name: "", id: "", token: "", clientToken: "" });
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showClientToken, setShowClientToken] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function saveInstance(instanceId, instanceToken, clientToken){
    setSaving(true)
    const res = await fetch(`http://localhost:8080/instance/${instanceId}/token/${instanceToken}/me`, {
      method: "GET",
      headers:  {
        "Content-Type": "application/json",
        "Client-Token": clientToken
      }  
    })

    const data = await res.json()
    console.log(data)
    setSaving(false)
    return data
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px w-10 bg-black/20" />
        <span className="font-satoshi text-xs font-semibold uppercase tracking-[0.25em] text-black/40">
          Configuration
        </span>
      </div>

      <h1 className="font-satoshi text-6xl font-semibold leading-[0.95] tracking-[-0.055em] text-zinc-950">
        Instance <span className="text-zinc-400">Credentials</span>
      </h1>

      <p className="mt-5 max-w-lg font-satoshi text-base leading-relaxed text-zinc-500">
        Configure your instance credentials to connect your application.
      </p>

      <div className="mt-10 max-w-lg space-y-5">
        
        <Field 

          label="Connection Name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange("name")}
        />

        <Field
          label="Instance ID"
          placeholder="3E1A9F2B"
          value={form.id}
          onChange={handleChange("id")}
        />
        <Field
          label="Token"
          placeholder="••••••••••••••••"
          type={showToken ? "text" : "password"}
          value={form.token}
          onChange={handleChange("token")}
          trailingIcon={
            <button
              type="button"
              onClick={() => setShowToken((prev) => !prev)}
              className="text-zinc-400 transition-colors hover:text-zinc-700 hover:cursor-pointer"
              aria-label={showToken ? "Ocultar token" : "Mostrar token"}
            >
              {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        <Field
          label="Client Token"
          placeholder="••••••••••••••••"
          type={showClientToken ? "text" : "password"}
          value={form.clientToken}
          onChange={handleChange("clientToken")}
          trailingIcon={
            <button
              type="button"
              onClick={() => setShowClientToken((prev) => !prev)}
              className="text-zinc-400 transition-colors hover:text-zinc-700 hover:cursor-pointer"
              aria-label={showClientToken ? "Ocultar client token" : "Mostrar client token"}
            >
              {showClientToken ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <button
          onClick={() => {saveInstance(form.id, form.token, form.clientToken)}}
          disabled={saving}
          className="mt-4 w-full rounded-xl bg-zinc-950 px-6 py-3.5 font-satoshi text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors hover:cursor-pointer hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save credentials"}
        </button>
      </div>
    </div>
  );
}



export default ConnectPage;