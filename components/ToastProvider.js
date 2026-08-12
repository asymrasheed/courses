"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#1f1b13",
          color: "#f8f3e7",
          border: "1px solid rgba(248,243,231,0.12)",
          borderRadius: "10px",
          fontSize: "0.875rem",
          fontFamily: "var(--font-archivo)",
        },
        success: { iconTheme: { primary: "#e9a23b", secondary: "#0d0b08" } },
        error: { iconTheme: { primary: "#d9704f", secondary: "#0d0b08" } },
      }}
    />
  );
}
