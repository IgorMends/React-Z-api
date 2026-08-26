function Field({label, value, onChange, placeholder, type, trailingIcon}) {
  return (
    <label className="block">
      <span className="mb-2 block font-satoshi text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 pr-11 font-satoshi text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-300 focus:border-zinc-950/40 focus:ring-4 focus:ring-zinc-950/5"
        />
        {trailingIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
            {trailingIcon}
          </div>
        )}
      </div>
    </label>
  );
}

export default Field;