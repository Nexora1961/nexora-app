import React from "react";
import ReactDOM from "react-dom/client";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";

function LoginPage() {
  const { login, authenticated, user } = usePrivy();

  return (
    <div
      style={{
        background: "#050510",
        minHeight: "100vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          color: "#8b5cf6",
          fontSize: "70px",
          marginBottom: "20px",
        }}
      >
        Nexora Wallet Login
      </h1>

      {!authenticated ? (
        <>
          <p style={{ fontSize: "24px", marginBottom: "40px" }}>
            Connect your wallet to access the Nexora ecosystem.
          </p>

          <button
            onClick={login}
            style={{
              background: "#8b5cf6",
              border: "none",
              color: "white",
              padding: "20px 50px",
              borderRadius: "16px",
              fontSize: "28px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Connect Wallet
          </button>
        </>
      ) : (
        <>
          <h2 style={{ fontSize: "42px", marginBottom: "20px" }}>
            Wallet Connected ✅
          </h2>

          <p
            style={{
              fontSize: "20px",
              marginBottom: "40px",
              color: "#cfcfcf",
            }}
          >
            {user?.wallet?.address}
          </p>

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <a
              href="https://staking.nexoracrypto.com"
              style={{
                background: "#8b5cf6",
                color: "white",
                padding: "16px 30px",
                borderRadius: "14px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Open Staking
            </a>

            <a
              href="https://www.bitmart.com/trade/en-US?symbol=NEX_USDT"
              style={{
                background: "#111827",
                color: "white",
                padding: "16px 30px",
                borderRadius: "14px",
                textDecoration: "none",
                fontWeight: "bold",
                border: "1px solid #8b5cf6",
              }}
            >
              Buy NEX
            </a>
          </div>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <PrivyProvider
    appId="cmp95s2uh00w40cjrnma5b8k3"
    config={{
      loginMethods: ["wallet"],
      appearance: {
        theme: "dark",
        accentColor: "#8b5cf6",
      },
    }}
  >
    <LoginPage />
  </PrivyProvider>
);
