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
          <h2>Wallet Connected ✅</h2>
          <p>{user?.wallet?.address}</p>
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <PrivyProvider
    appId=cmp95s2uh00w40cjrma5b8k3
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
