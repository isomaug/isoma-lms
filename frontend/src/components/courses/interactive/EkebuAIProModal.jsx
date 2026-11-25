import { SearchableSelect } from "@/components/ui/SearchableSelect";
import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaShieldAlt, FaTag } from "react-icons/fa";
import {
  CheckCircle2,
  Sparkles,
  Zap,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";

export default function EkebuAIProModal({
  isOpen,
  onClose,
  defaultPlan = "MONTHLY",
}) {
  const { isAuthenticated, openAuthModal, me, refreshUser } = useAuth();
  const { formatPrice, activeCurrencyCode } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [countryCode, setCountryCode] = useState("+256");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponNotice, setCouponNotice] = useState("");
  const [authState, setAuthState] = useState("idle"); // "idle" | "submitting" | "redirecting" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const countryDialCodes = [
    { code: "+256", country: "Uganda (+256)" },
    { code: "+254", country: "Kenya (+254)" },
    { code: "+255", country: "Tanzania (+255)" },
    { code: "+250", country: "Rwanda (+250)" },
    { code: "+1", country: "USA/Canada (+1)" },
    { code: "+44", country: "UK (+44)" },
    { code: "+234", country: "Nigeria (+234)" },
    { code: "+27", country: "South Africa (+27)" },
    { code: "+", country: "Other" },
  ];

  const plans = [
    {
      id: "MONTHLY",
      name: "1 Month Pass",
      ugxPrice: 15000,
      badge: null,
    },
    {
      id: "QUARTERLY",
      name: "3 Month Pass",
      ugxPrice: 40000,
      badge: "Save 11%",
    },
    {
      id: "ANNUAL",
      name: "1 Year Pass",
      ugxPrice: 120000,
      badge: "Best Value (Save 33%)",
    },
  ];

  const handleApplyCoupon = async () => {
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    setCouponNotice("Checking coupon...");
    try {
      const res = await fetch("/api/courses/ekebu-ai/coupon/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coupon_code: clean, plan: selectedPlan }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: clean,
          discountPercent: data.discount_percent,
        });
        setCouponNotice(
          data.message || `Coupon Applied: ${data.discount_percent}% Discount`
        );
      } else {
        setCouponNotice(data.error || "Invalid or expired coupon code.");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponNotice("Error validating coupon.");
      setAppliedCoupon(null);
    }
  };

  const getDiscountedPrice = (originalPrice) => {
    if (!appliedCoupon) return originalPrice;
    const discount = (originalPrice * appliedCoupon.discountPercent) / 100;
    return Math.max(0, originalPrice - discount);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      onClose();
      openAuthModal("login");
      return;
    }

    setAuthState("submitting");
    setErrorMsg("");

    const fullPhone = phoneNumber.trim()
      ? `${countryCode}${phoneNumber.replace(/^[0+]/, "")}`
      : "";

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setAuthState("error");
        setErrorMsg("Your session has timed out. Please login again.");
        return;
      }

      const res = await fetch("/api/courses/pro-pass/checkout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          phone_number: fullPhone,
          coupon_code: appliedCoupon ? appliedCoupon.code : couponCode.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (
          data.free_grant ||
          (appliedCoupon && appliedCoupon.discountPercent === 100)
        ) {
          await refreshUser();
          window.dispatchEvent(new CustomEvent("entitlement-updated"));
          setAuthState("free_success");
        } else if (data.redirect_url) {
          setAuthState("redirecting");
          setTimeout(() => {
            window.location.href = data.redirect_url;
          }, 800);
        } else {
          setAuthState("error");
          setErrorMsg(data.error || "Failed to initiate payment gateway.");
        }
      } else {
        setAuthState("error");
        setErrorMsg(data.error || "Failed to initiate payment gateway.");
      }
    } catch (err) {
      console.error("Pro Pass checkout error:", err);
      setAuthState("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    setAuthState("idle");
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        onClick={handleClose}
        className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 p-3 sm:p-5 font-['Inter',sans-serif]"
      >
        <Motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto overflow-x-hidden rounded-2xl border border-border bg-background p-5 text-[14px] text-foreground shadow-2xl sm:p-7 font-['Inter',sans-serif]"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            title="Close"
          >
            <FaTimes size={15} />
          </button>

          {/* Submitting Spinner Overlay */}
          {authState === "submitting" && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 font-['Inter',sans-serif]">
              <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Processing Request
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Verifying subscription and details...
                </p>
              </div>
            </div>
          )}

          {/* Redirecting Success Overlay */}
          {authState === "redirecting" && (
            <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 font-['Inter',sans-serif]">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Order Prepared
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Redirecting to Mobile Money & Card Checkout...
                </p>
              </div>
            </div>
          )}

          {/* 100% Free Coupon Success Overlay */}
          {authState === "free_success" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 font-['Inter',sans-serif]">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-md">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-foreground">
                  Free Pro Pass Activated!
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Your Pro Pass subscription is now active. Enjoy unlimited AI
                  chats, document exports, and image generation!
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                Start Using Pro Pass
              </button>
            </div>
          )}

          {/* Main Content */}
          {me?.profile?.is_pro ? (
            <div className="space-y-6 font-['Inter',sans-serif] overflow-x-hidden text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  Active EkebuAI Pro Pass
                </h2>
                <p className="text-sm text-muted-foreground leading-normal max-w-sm mx-auto">
                  You already have unlimited chats, document exports, and AI
                  image generation enabled. Enjoy!
                </p>
              </div>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm hover:bg-primary/90 transition-all"
              >
                Continue Learning
              </button>
            </div>
          ) : (
            (authState === "idle" || authState === "error") && (
              <div className="space-y-5 font-['Inter',sans-serif] overflow-x-hidden">
                {/* Header */}
                <div className="space-y-2 pt-1 text-center">
                  <div className="mb-2 flex items-center justify-center gap-3">
                    <img
                      src="/favicon.ico"
                      alt=""
                      className="h-8 w-8 object-contain"
                    />
                    <h2 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                      EkebuAI Pro
                    </h2>
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    Upgrade Your AI Assistant
                  </h3>
                  <p className="mx-auto max-w-sm text-[13px] leading-normal text-muted-foreground">
                    Unlimited chats, Word & Excel document exports, and AI image
                    generation.
                  </p>
                </div>

                {/* Plans Selection Form */}
                <form
                  onSubmit={handleCheckout}
                  className="space-y-4 overflow-x-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-muted-foreground px-0.5">
                      <span className="font-bold uppercase tracking-wider text-xs">
                        Select Plan
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        Currency: {activeCurrencyCode}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {plans.map((p) => {
                        const isSelected = selectedPlan === p.id;
                        const finalPrice = getDiscountedPrice(p.ugxPrice);
                        const formattedPrice = formatPrice(finalPrice);

                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPlan(p.id)}
                            className={`flex min-h-[68px] items-center justify-between gap-2 overflow-x-hidden rounded-xl border p-3 cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border bg-card hover:bg-muted/40"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-500"
                                    : "border-muted-foreground/40"
                                }`}
                              >
                                {isSelected && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                )}
                              </div>
                              <span className="font-bold text-sm text-foreground truncate">
                                {p.name}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0 justify-center">
                              <div className="font-bold text-sm text-foreground flex items-center gap-1.5 shrink-0 justify-end text-right min-w-[65px]">
                                {appliedCoupon &&
                                  appliedCoupon.discountPercent > 0 && (
                                    <span className="line-through text-xs text-muted-foreground font-normal">
                                      {formatPrice(p.ugxPrice)}
                                    </span>
                                  )}
                                <span className="text-primary font-extrabold text-sm">
                                  {formattedPrice}
                                </span>
                              </div>
                              {p.badge && (
                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center justify-center whitespace-nowrap shrink-0">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Coupon Code Section */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Have a Coupon Code?
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ticket className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground/60" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter code (e.g. EKEBU50)"
                          className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-[13px] uppercase tracking-wide outline-none placeholder:text-[12px] placeholder:normal-case placeholder:tracking-normal focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold text-sm rounded-xl transition-all shrink-0 cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponNotice && (
                      <p
                        className={`text-xs font-semibold ${appliedCoupon ? "text-emerald-500" : "text-amber-500"}`}
                      >
                        {couponNotice}
                      </p>
                    )}
                  </div>

                  {/* Mobile Money / Phone Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground block">
                      Mobile Money / Phone Number (Optional)
                    </label>
                    <div className="flex gap-2">
                      <SearchableSelect
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="h-10 w-[88px] shrink-0 cursor-pointer overflow-hidden text-ellipsis rounded-xl border border-border bg-background px-2 text-[13px] text-foreground outline-none focus:ring-1 focus:ring-primary"
                      >
                        {countryDialCodes.map((c) => (
                          <option key={c.code + c.country} value={c.code}>
                            {c.code} ({c.country.split(" ")[0]})
                          </option>
                        ))}
                      </SearchableSelect>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. 770000000"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-[13px] outline-none placeholder:text-[12px] focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-destructive font-medium text-center bg-destructive/10 p-2.5 rounded-xl border border-destructive/20">
                      {errorMsg}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {appliedCoupon && appliedCoupon.discountPercent === 100
                        ? "Claim Free Pro Pass"
                        : "Proceed to Payment"}
                    </span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
                    <FaShieldAlt className="text-emerald-500" />
                    <span>
                      Secured by Pesapal • Mobile Money & Credit Cards
                    </span>
                  </div>
                </form>
              </div>
            )
          )}
        </Motion.div>
      </div>
    </AnimatePresence>
  );
}
