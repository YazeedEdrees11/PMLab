"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { resultsApi } from "@/lib/api";
import {
  CheckCircle2,
  Clock,
  Download,
  Search,
  Filter,
  Loader2,
  TestTube,
  LineChart as LineChartIcon,
  TrendingUp,
  X
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { cn } from "@/lib/utils";

export default function ResultsPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTestForChart, setSelectedTestForChart] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await resultsApi.getMine();
        setResults(data || []);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filteredResults = results.filter((result) => {
    const name = result.test?.name?.toLowerCase() || "";
    const nameAr = result.test?.nameAr?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return name.includes(q) || nameAr.includes(q);
  });
  
  // Group results for charting
  const groupResultsByTest = () => {
    const groups: Record<string, any[]> = {};
    results.forEach(r => {
      if (r.numericValue) {
        const testId = r.testId;
        if (!groups[testId]) groups[testId] = [];
        groups[testId].push({
          date: new Date(r.createdAt).toLocaleDateString(isRtl ? "ar-JO" : "en-US", { month: 'short', day: 'numeric' }),
          value: r.numericValue,
          originalDate: new Date(r.createdAt)
        });
      }
    });
    // Sort by date
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
    });
    return groups;
  };

  const chartGroups = groupResultsByTest();

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t("my_results")}</h1>
        </div>
        <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
          {isRtl ? "جميع نتائج فحوصاتك المخبرية ومتابعة تطور صحتك" : "All your laboratory results and health evolution tracking"}
        </p>
      </div>

      {/* Health Evolution Highlights */}
      {Object.keys(chartGroups).length > 0 && !selectedTestForChart && (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
           {Object.keys(chartGroups).map(testId => {
             const data = chartGroups[testId];
             if (data.length < 2) return null;
             const result = results.find(r => r.testId === testId);
             const testName = isRtl ? result.test?.nameAr : result.test?.name;
             return (
               <Card 
                key={testId} 
                onClick={() => setSelectedTestForChart({ id: testId, name: testName, data })}
                className="shrink-0 w-64 border-0 bg-white shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer group rounded-[24px]"
               >
                 <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                       <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                          <TrendingUp className="h-5 w-5" />
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRtl ? "تطور الفحص" : "Evolution"}</span>
                    </div>
                    <p className="font-black text-slate-900 group-hover:text-primary transition-colors truncate">{testName}</p>
                    <p className="text-2xl font-black mt-2">{data[data.length - 1].value} <span className="text-xs text-slate-400">Latest</span></p>
                    
                    <div className="h-12 w-full mt-4 opacity-50">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data}>
                             <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </CardContent>
               </Card>
             );
           })}
        </div>
      )}

      {/* Chart Detail View */}
      <AnimatePresence>
        {selectedTestForChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-0 bg-slate-900 text-white rounded-[40px] shadow-2xl overflow-hidden relative mb-10">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
               <CardContent className="p-10">
                  <div className="flex justify-between items-center mb-10 relative z-10">
                     <div>
                        <h2 className="text-3xl font-black mb-2">{selectedTestForChart.name}</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{isRtl ? "الرسم البياني لتطور النتائج" : "Historical Evolution Chart"}</p>
                     </div>
                     <button 
                        onClick={() => setSelectedTestForChart(null)}
                        className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all"
                     >
                        <X className="h-6 w-6" />
                     </button>
                  </div>

                  <div className="h-80 w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedTestForChart.data}>
                        <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#ffffff60" 
                          fontSize={10} 
                          fontWeight="bold"
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#ffffff60" 
                          fontSize={10} 
                          fontWeight="bold"
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ fontWeight: 'black', color: '#fff' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3b82f6" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorVal)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 ${isRtl ? "right-4" : "left-4"}`} />
          <Input
            placeholder={isRtl ? "ابحث عن فحص..." : "Search tests..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`h-12 rounded-xl border-slate-200 ${isRtl ? "pr-12" : "pl-12"}`}
          />
        </div>
        <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 font-bold gap-2">
          <Filter className="h-4 w-4" />
          {isRtl ? "تصفية" : "Filter"}
        </Button>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="space-y-3">
          {filteredResults.map((result) => (
            <Card key={result.id} className="border-0 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                      result.status === "READY" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {result.status === "READY" ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {isRtl ? result.test?.nameAr || result.test?.name : result.test?.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium">
                      <span>
                        {new Date(result.createdAt).toLocaleDateString(isRtl ? "ar-JO" : "en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {result.status === "READY" ? (
                      <>
                        <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                          {t("status_ready")}
                        </span>
                        {result.fileUrl ? (
                          <a href={result.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-10 w-10 p-0 rounded-xl border-slate-200">
                              <Download className="h-4 w-4 text-slate-500" />
                            </Button>
                          </a>
                        ) : (
                          <Button size="sm" variant="outline" disabled className="h-10 w-10 p-0 rounded-xl border-slate-200 opacity-50">
                             <Download className="h-4 w-4 text-slate-500" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                        {t("status_pending")}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl text-center border-0 shadow-sm">
          <TestTube className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">{isRtl ? "لا توجد نتائج" : "No results found"}</h3>
          <p className="text-slate-500 text-sm">
            {searchQuery 
              ? (isRtl ? "لم يتم العثور على نتائج تطابق بحثك." : "No results match your search.") 
              : (isRtl ? "لم تقم بإجراء أي فحوصات بعد." : "You haven't taken any tests yet.")}
          </p>
        </div>
      )}
    </div>
  );
}
