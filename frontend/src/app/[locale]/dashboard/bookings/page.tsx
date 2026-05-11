"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { appointmentsApi } from "@/lib/api";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function BookingsPage() {
  const t = useTranslations("Dashboard");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await appointmentsApi.getMine();
        const sorted = (data || []).sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(sorted);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const upcoming = bookings.filter((b) => b.status === "PENDING" || b.status === "CONFIRMED");
  const past = bookings.filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED");

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="h-2.5 w-8 rounded-full bg-primary shadow-sm" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t("my_bookings")}</h1>
          </div>
          <p className="text-slate-500 font-bold max-w-2xl leading-relaxed">
            {isRtl ? "حجوزاتك الحالية والسابقة" : "Your current and past appointments"}
          </p>
        </div>
        <Link href={`/${locale}/dashboard/bookings/new`}>
          <Button className="h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20">
            <Plus className={`h-5 w-5 ${isRtl ? "ml-2" : "mr-2"}`} />
            {t("book_new_test")}
          </Button>
        </Link>
      </div>

      {/* Upcoming */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {t("upcoming_appointments")}
        </h2>
        {upcoming.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-200 rounded-2xl bg-transparent">
            <CardContent className="p-10 text-center text-slate-400 font-medium">
              {t("no_bookings")}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((booking) => (
              <Card key={booking.id} className="border-0 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0">
                      <span className="text-lg font-extrabold leading-none">
                        {new Date(booking.date).getDate()}
                      </span>
                      <span className="text-[10px] font-bold opacity-70">
                        {new Date(booking.date).toLocaleDateString(isRtl ? "ar-JO" : "en-US", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900">
                        {booking.testItems?.length > 0 
                          ? (isRtl 
                              ? (booking.testItems[0].test.nameAr || booking.testItems[0].test.name) 
                              : (booking.testItems[0].test.name || booking.testItems[0].test.nameAr)
                            ) 
                          : (isRtl ? "فحص طبي" : "Medical Test")}
                        {booking.testItems?.length > 1 && ` +${booking.testItems.length - 1}`}
                      </p>
                      {booking.totalPrice && (
                        <p className="text-primary font-bold text-xs mt-0.5">
                          {booking.totalPrice} {isRtl ? "د.أ" : "JOD"}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {booking.time || "TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> 
                          {booking.homeVisit ? (isRtl ? "زيارة منزلية" : "Home Visit") : (isRtl ? (booking.branch?.nameAr || booking.branch?.name) : (booking.branch?.name || booking.branch?.nameAr))}
                        </span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${
                      booking.status === "COMPLETED" ? "bg-green-50 text-green-700" :
                      booking.status === "CANCELLED" ? "bg-red-50 text-red-700" :
                      booking.status === "CONFIRMED" ? "bg-blue-50 text-blue-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {booking.status === "COMPLETED" ? (isRtl ? "مكتمل" : "Completed") :
                       booking.status === "CANCELLED" ? (isRtl ? "ملغي" : "Cancelled") :
                       booking.status === "CONFIRMED" ? (isRtl ? "مؤكد" : "Confirmed") :
                       (isRtl ? "قيد الانتظار" : "Pending")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {isRtl ? "الحجوزات السابقة" : "Past Appointments"}
          </h2>
          <div className="space-y-3">
            {past.map((booking) => (
              <Card key={booking.id} className="border-0 bg-white rounded-2xl shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-500 shrink-0">
                      <span className="text-lg font-extrabold leading-none">
                        {new Date(booking.date).getDate()}
                      </span>
                      <span className="text-[10px] font-bold">
                        {new Date(booking.date).toLocaleDateString(isRtl ? "ar-JO" : "en-US", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-700">
                        {booking.testItems?.length > 0 
                          ? (isRtl 
                              ? (booking.testItems[0].test.nameAr || booking.testItems[0].test.name) 
                              : (booking.testItems[0].test.name || booking.testItems[0].test.nameAr)
                            ) 
                          : (isRtl ? "فحص طبي" : "Medical Test")}
                        {booking.testItems?.length > 1 && ` +${booking.testItems.length - 1}`}
                      </p>
                      {booking.totalPrice && (
                        <p className="text-primary font-bold text-xs mt-0.5">
                          {booking.totalPrice} {isRtl ? "د.أ" : "JOD"}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {booking.time || "TBD"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> 
                          {booking.homeVisit ? (isRtl ? "زيارة منزلية" : "Home Visit") : (isRtl ? (booking.branch?.nameAr || booking.branch?.name) : (booking.branch?.name || booking.branch?.nameAr))}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold shrink-0">
                      {booking.status === "COMPLETED" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {t("stat_completed")}
                        </>
                      ) : (
                         isRtl ? "ملغي" : "Cancelled"
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
