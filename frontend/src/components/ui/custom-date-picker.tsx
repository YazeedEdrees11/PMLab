"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./button";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  isRtl?: boolean;
  placeholder?: string;
  minDate?: Date;
}

export function CustomDatePicker({ value, onChange, isRtl, placeholder, minDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value) : null;

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const months = isRtl 
    ? ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const daysOfWeek = isRtl
    ? ["ح", "ن", "ث", "ر", "خ", "ج", "س"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(newDate.toISOString().split("T")[0]);
    setIsOpen(false);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderDays = () => {
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let i = 1; i <= totalDays; i++) {
      const isBeforeMin = minDate && new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i) < new Date(minDate.setHours(0,0,0,0));
      
      const isSelected = selectedDate && 
        selectedDate.getDate() === i && 
        selectedDate.getMonth() === currentMonth.getMonth() && 
        selectedDate.getFullYear() === currentMonth.getFullYear();
      
      const isToday = new Date().getDate() === i && 
        new Date().getMonth() === currentMonth.getMonth() && 
        new Date().getFullYear() === currentMonth.getFullYear();
      
      days.push(
        <button
          key={i}
          disabled={isBeforeMin}
          onClick={() => handleDateSelect(i)}
          className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
            isSelected 
              ? "bg-primary text-white shadow-lg shadow-primary/30" 
              : isToday
                ? "bg-primary/10 text-primary"
                : isBeforeMin
                  ? "opacity-20 cursor-not-allowed"
                  : "hover:bg-slate-50 text-slate-700"
          }`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="h-16 w-full rounded-[24px] border-2 border-white bg-white shadow-sm flex items-center px-8 cursor-pointer group transition-all focus-within:border-primary"
      >
        <CalendarIcon className={`h-5 w-5 ${isRtl ? "ml-4" : "mr-4"} ${isOpen ? "text-primary" : "text-slate-400"} group-hover:text-primary transition-colors`} />
        <span className={`text-lg font-black ${value ? "text-slate-900" : "text-slate-400"}`}>
          {value ? value : (placeholder || (isRtl ? "اختر التاريخ" : "Select Date"))}
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] mt-4 p-6 bg-white rounded-[32px] shadow-2xl border border-slate-100 min-w-[320px]"
          >
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-xl h-10 w-10">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h4 className="font-black text-slate-900">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h4>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-xl h-10 w-10">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="h-10 w-10 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderDays()}
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                        onChange(new Date().toISOString().split("T")[0]);
                        setIsOpen(false);
                    }}
                    className="text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary/5"
                >
                    {isRtl ? "اليوم" : "Today"}
                </Button>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                        onChange("");
                        setIsOpen(false);
                    }}
                    className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50"
                >
                    {isRtl ? "مسح" : "Clear"}
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
