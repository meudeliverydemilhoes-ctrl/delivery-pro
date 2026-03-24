import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

/**
 * MobileSelect — bottom sheet on mobile, native select on desktop.
 * Props match a basic <select>: value, onChange, options [{value, label}], placeholder, className
 */
export default function MobileSelect({ value, onChange, options = [], placeholder = "Selecionar...", className = "" }) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex h-11 w-full items-center justify-between rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#7c6bff] ${className}`}
        style={{ minHeight: 44 }}
      >
        <span className={selected ? "text-white" : "text-white/40"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className="text-white/40" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            {/* Bottom sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0d14] border-t border-white/10 rounded-t-2xl max-h-[70vh] flex flex-col"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-2 flex-shrink-0" />
              {placeholder && (
                <p className="text-xs text-white/40 text-center pb-2 flex-shrink-0">{placeholder}</p>
              )}
              <div className="overflow-y-auto">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className="w-full flex items-center justify-between px-6 text-left text-white hover:bg-white/5 active:bg-white/10"
                    style={{ minHeight: 52 }}
                  >
                    <span className="text-sm">{opt.label}</span>
                    {value === opt.value && <Check size={18} className="text-[#7c6bff]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}