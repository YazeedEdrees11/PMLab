"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  isRtl?: boolean;
  placeholder?: string;
}

export function CustomTimePicker({ value, onChange, isRtl, placeholder }: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, "0"));

  const selectedHour = value ? value.split(":")[0] : "09";
  const selectedMinute = value ? value.split(":")[1] : "00";

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTimeSelect = (h: string, m: string) => {
    onChange(`${h}:${m}`);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-full rounded-[24px] border-2 border-white bg-white shadow-sm flex items-center px-8 cursor-pointer group transition-all focus-within:border-primary"
      >
        <Clock className={`h-5 w-5 ${isRtl ? "ml-4" : "mr-4"} ${isOpen ? "text-primary" : "text-slate-400"} group-hover:text-primary transition-colors`} />
        <span className={`text-lg font-black ${value ? "text-slate-900" : "text-slate-400"}`}>
          {value ? value : (placeholder || (isRtl ? "اختر الوقت" : "Select Time"))}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] mt-4 p-6 bg-white rounded-[32px] shadow-2xl border border-slate-100 min-w-[300px]"
          >
            <div className="flex gap-4 h-64">
              {/* Hours Column */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center sticky top-0 bg-white py-2">
                    {isRtl ? "الساعة" : "Hour"}
                </p>
                <div className="space-y-1">
                  {hours.map((h) => (
                    <button
                      key={h}
                      onClick={() => handleTimeSelect(h, selectedMinute)}
                      className={`w-full h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                        selectedHour === h ? "bg-primary text-white" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes Column */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center sticky top-0 bg-white py-2">
                    {isRtl ? "الدقيقة" : "Min"}
                </p>
                <div className="space-y-1">
                  {minutes.map((m) => (
                    <button
                      key={m}
                      onClick={() => handleTimeSelect(selectedHour, m)}
                      className={`w-full h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
                        selectedMinute === m ? "bg-primary text-white" : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50">
              <Button 
                className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                onClick={() => setIsOpen(false)}
              >
                {isRtl ? "تأكيد" : "Confirm"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
