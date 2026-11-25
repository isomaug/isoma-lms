import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/api/client/apiClient";

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState([]);
  const [activeCurrencyCode, setActiveCurrencyCode] = useState("UGX");
  const [loading, setLoading] = useState(true);

  // Guess currency from Timezone
  const guessCurrency = () => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Nairobi")) return "KES";
      if (tz.includes("Dar_es_Salaam")) return "TZS";
      if (tz.includes("Kigali")) return "RWF";
      if (tz.includes("Kampala")) return "UGX";
      // Default fallback
      return "UGX";
    } catch (e) {
      return "UGX";
    }
  };

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await apiFetch("/api/courses/currencies/");
        if (response.ok) {
          const data = await response.json();
          const currencyList = data.results || data;
          // Prepend UGX as the base currency
          const allCurrencies = [
            { code: "UGX", symbol: "UGX", exchange_rate_to_ugx: "1.000000" },
            ...(Array.isArray(currencyList) ? currencyList : []),
          ];
          setCurrencies(allCurrencies);

          // Check local storage for user preference
          const savedCurrency = localStorage.getItem("selectedCurrency");
          if (
            savedCurrency &&
            allCurrencies.find((c) => c.code === savedCurrency)
          ) {
            setActiveCurrencyCode(savedCurrency);
          } else {
            let guessed = guessCurrency();
            if (allCurrencies.find((c) => c.code === guessed)) {
              setActiveCurrencyCode(guessed);
              localStorage.setItem("selectedCurrency", guessed);
            } else {
              setActiveCurrencyCode("UGX");
            }
          }
        }
      } catch (error) {
        console.error("Failed to load currencies:", error);
        setCurrencies([
          { code: "UGX", symbol: "UGX", exchange_rate_to_ugx: "1.000000" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const setCurrency = (code) => {
    if (currencies.find((c) => c.code === code)) {
      setActiveCurrencyCode(code);
      localStorage.setItem("selectedCurrency", code);
    }
  };

  const activeCurrency = currencies.find(
    (c) => c.code === activeCurrencyCode
  ) || {
    code: "UGX",
    symbol: "UGX",
    exchange_rate_to_ugx: "1.000000",
  };

  const formatPrice = (ugxPrice) => {
    const priceNum = Number(ugxPrice);
    if (isNaN(priceNum)) return "0";
    if (priceNum === 0) return "Free";

    if (activeCurrency.code === "UGX") {
      return `UGX ${priceNum.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    }

    let converted = priceNum * parseFloat(activeCurrency.exchange_rate_to_ugx);

    // Smart rounding for nice marketing numbers
    if (converted <= 100) {
      converted = Math.ceil(converted / 5) * 5;
    } else if (converted <= 1000) {
      converted = Math.ceil(converted / 50) * 50;
    } else if (converted <= 10000) {
      converted = Math.ceil(converted / 500) * 500;
    } else if (converted <= 100000) {
      converted = Math.ceil(converted / 1000) * 1000;
    } else {
      converted = Math.ceil(converted / 5000) * 5000;
    }

    return `${activeCurrency.symbol} ${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        activeCurrencyCode,
        activeCurrency,
        setCurrency,
        formatPrice,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
