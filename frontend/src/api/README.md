# Frontend API Clients & Domain Architecture (`src/api/`)

This directory houses HTTP client layers, token lifecycle managers, and domain-specific endpoint interfaces.

---

## 🏛️ Directory Structure

```
src/api/
├── README.md              # Domain catalog & client documentation
│
├── auth/                  # Authentication & session token management
│   ├── tokens.js          # LocalStorage token store (setTokens, getAccessToken, clearTokens)
│   └── index.js           # Re-exports token lifecycle helpers
│
├── client/                # Central HTTP client & network interceptors
│   ├── apiClient.js       # Base authenticated fetcher (apiFetch, swrFetcher, auto-token refresh)
│   └── index.js           # Re-exports client fetchers
│
└── finance/               # Multi-tenant business ledger & financial tracker APIs
    ├── accountsApi.js     # Bank accounts, balances & reconciliation
    ├── budgetPlansApi.js  # Monthly budget plan models & allocations
    ├── categoriesApi.js   # Transaction category management
    ├── loansApi.js        # Loan servicing, repayment tracking & installments
    ├── transactionsApi.js # Transactions ledger, filtering & offline queue
    ├── workspacesApi.js   # Multi-tenant finance workspace switching
    ├── index.js           # Re-exports unified finance domain API
    └── README.md          # Finance API blueprint & offline storage strategy
```

---

## 🧭 Client Usage Guide

### Authenticated Requests
```javascript
import { apiFetch, swrFetcher } from "@/api/client/apiClient";
import useSWR from "swr";

// With SWR:
const { data, error } = useSWR("/api/courses/", swrFetcher);

// Manual Fetch with Auto-Token Refresh:
const res = await apiFetch("/api/admin/cohorts/", {
  method: "POST",
  body: JSON.stringify({ name: "Cohort Alpha" })
});
```

### Auth Tokens
```javascript
import { getAccessToken, setTokens, clearTokens } from "@/api/auth/tokens";

const token = getAccessToken();
```

### Finance Domain
```javascript
import { 
  fetchTransactions, 
  createTransaction, 
  getActiveWorkspace 
} from "@/api/finance";
```
