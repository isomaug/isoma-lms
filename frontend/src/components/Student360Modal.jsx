import React, { useEffect, useState } from "react";
import {
  X,
  BookOpen,
  Library,
  Wallet,
  UtensilsCrossed,
  BedDouble,
  HeartPulse,
  Shield,
  Bus,
  Trophy,
  Download,
} from "lucide-react";

function formatUgx(val) {
  return `UGX ${Number(val || 0).toLocaleString()}`;
}

export default function Student360Modal({ studentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    fetch(`/api/campus/students/${studentId}/360/`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [studentId]);

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="page-enter w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden my-auto">
        <div className="h-1 bg-gradient-to-r from-primary via-primary/60 to-primary" />
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Unified Student 360 Profile - All School Departments Linked
            </p>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mt-0.5">
              {data ? `${data.student.full_name} (${data.student.registration_number})` : "Loading student..."}
            </h2>
            {data && (
              <p className="text-xs text-gray-500 mt-0.5">
                {data.student.class_stream} · {data.student.curriculum} · Parent: {data.student.parent_name || "-"} ({data.student.parent_phone || "-"})
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-4 text-xs">
          {loading || !data ? (
            <p className="text-center text-gray-400 py-10">
              {loading ? "Loading linked records across all departments..." : "Could not load student profile."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Academics */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-bold text-gray-900">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Academics &amp; Report Card
                  </span>
                  {data.academics.pdf_url && (
                    <a
                      href={data.academics.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary font-semibold hover:underline"
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </a>
                  )}
                </div>
                <p className="text-gray-600">
                  Average: <span className="font-bold text-primary">{data.academics.average_score ?? "-"}%</span> · Position:{" "}
                  <span className="font-bold text-gray-900">{data.academics.class_position}</span>
                </p>
                <div className="space-y-1 pt-1 border-t border-gray-100">
                  {data.academics.marks.slice(0, 6).map((m, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span className="text-gray-700">{m.subject}</span>
                      <span className="font-bold text-gray-900">
                        {m.total}% ({m.grade})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Bursar / Fees */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-bold text-gray-900">
                    <Wallet className="w-4 h-4 text-primary" />
                    Bursar &amp; School Fees
                  </span>
                  <span className={`font-bold text-[11px] ${data.finance.cleared ? "text-emerald-700" : "text-amber-700"}`}>
                    {data.finance.cleared ? "Cleared" : "Balance Due"}
                  </span>
                </div>
                <p className="text-gray-600">
                  Billed: <span className="font-semibold text-gray-900">{formatUgx(data.finance.total_billed_ugx)}</span>
                </p>
                <p className="text-gray-600">
                  Paid: <span className="font-semibold text-emerald-700">{formatUgx(data.finance.total_paid_ugx)}</span> · Balance:{" "}
                  <span className="font-bold text-primary">{formatUgx(data.finance.balance_ugx)}</span>
                </p>
                {data.finance.invoices[0] && (
                  <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                    Receipt: {data.finance.invoices[0].receipt} ({data.finance.invoices[0].term})
                  </p>
                )}
              </div>

              {/* 3. Library */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-bold text-gray-900">
                    <Library className="w-4 h-4 text-primary" />
                    Library Circulation
                  </span>
                  <span className="font-bold text-primary text-[11px]">
                    {data.library.active_loans} Active Loan(s)
                  </span>
                </div>
                {data.library.loans.length === 0 ? (
                  <p className="text-gray-400">No books borrowed.</p>
                ) : (
                  data.library.loans.map((l) => (
                    <div key={l.id} className="text-[11px] text-gray-700">
                      <p className="font-semibold text-gray-900">{l.book_title}</p>
                      <p className="text-gray-500">
                        Status: <span className="font-semibold text-primary">{l.status}</span> · Due: {l.due_date}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* 4. Cashless Canteen POS */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-bold text-gray-900">
                    <UtensilsCrossed className="w-4 h-4 text-primary" />
                    Cashless Canteen Wallet
                  </span>
                  <span className="font-bold text-emerald-700 text-[11px]">
                    {data.canteen ? formatUgx(data.canteen.balance_ugx) : "-"}
                  </span>
                </div>
                {data.canteen && (
                  <>
                    <p className="text-gray-500 text-[11px]">
                      Daily Spend Limit: {formatUgx(data.canteen.daily_limit_ugx)}
                    </p>
                    <div className="space-y-1 pt-1 border-t border-gray-100">
                      {data.canteen.transactions.map((tx) => (
                        <div key={tx.id} className="flex justify-between text-[11px]">
                          <span className="text-gray-700">{tx.item}</span>
                          <span className={tx.type === "TOPUP" ? "font-bold text-emerald-700" : "font-semibold text-gray-900"}>
                            {tx.type === "TOPUP" ? "+" : "-"}
                            {formatUgx(tx.amount_ugx)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* 5. Boarding / Dormitory */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-1.5">
                <span className="inline-flex items-center gap-1.5 font-bold text-gray-900">
                  <BedDouble className="w-4 h-4 text-primary" />
                  Boarding &amp; Dormitory
                </span>
                {data.boarding ? (
                  <p className="text-gray-600 text-[11px]">
                    <span className="font-semibold text-gray-900">{data.boarding.house_name}</span> · {data.boarding.dormitory_room} · Bed{" "}
                    <span className="font-bold text-primary">{data.boarding.bed_number}</span>
                    <br />
                    Housemaster: {data.boarding.housemaster}
                  </p>
                ) : (
                  <p className="text-gray-400 text-[11px]">Day Scholar (No dormitory bed assigned)</p>
                )}
              </div>

              {/* 6. Nurse / Sickbay */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-1.5">
                <span className="inline-flex items-center gap-1.5 font-bold text-gray-900">
                  <HeartPulse className="w-4 h-4 text-primary" />
                  Nurse &amp; Sickbay
                </span>
                <p className="text-[11px] text-gray-600">
                  Blood Group: <span className="font-bold text-primary">{data.sickbay.blood_group}</span> · Allergies:{" "}
                  <span className="font-semibold text-gray-900">{data.sickbay.allergies}</span>
                </p>
                {data.sickbay.visits.length > 0 ? (
                  <p className="text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                    Last visit ({data.sickbay.visits[0].date}): {data.sickbay.visits[0].complaint} - {data.sickbay.visits[0].treatment}
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-400">No recent sickbay visits.</p>
                )}
              </div>

              {/* 7. Attendance, Gate Pass & Transport */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-1.5">
                <span className="inline-flex items-center gap-1.5 font-bold text-gray-900">
                  <Shield className="w-4 h-4 text-primary" />
                  Attendance, Security Gate &amp; Transport
                </span>
                <p className="text-[11px] text-gray-600">
                  Recent Attendance: <span className="font-bold text-emerald-700">{data.attendance_and_gate.present_count} / {data.attendance_and_gate.total_days}</span> Present
                </p>
                {data.transport && (
                  <p className="text-[11px] text-gray-600 inline-flex items-center gap-1">
                    <Bus className="w-3.5 h-3.5 text-primary shrink-0" />
                    {data.transport.route_name} ({data.transport.pickup_stop} · {data.transport.vehicle_plate})
                  </p>
                )}
              </div>

              {/* 8. Games, Clubs & Conduct */}
              <div className="rounded-xl border border-gray-200 p-4 space-y-1.5">
                <span className="inline-flex items-center gap-1.5 font-bold text-gray-900">
                  <Trophy className="w-4 h-4 text-primary" />
                  Clubs, Sports &amp; Conduct
                </span>
                {data.co_curricular.clubs.map((c) => (
                  <p key={c.id} className="text-[11px] text-gray-700">
                    <span className="font-semibold text-gray-900">{c.club_name}</span> ({c.role}) · {c.sports_house}
                  </p>
                ))}
                {data.co_curricular.conduct[0] && (
                  <p className="text-[11px] text-emerald-700 font-semibold pt-1 border-t border-gray-100">
                    +{data.co_curricular.conduct[0].points} pts ({data.co_curricular.conduct[0].type}): {data.co_curricular.conduct[0].reason}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
