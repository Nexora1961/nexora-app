import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";

const NEX_TOKEN_ADDRESS = "0x58412ae274f2764b71c66315d97662d47d930d94";

const SUPABASE_URL = "https://vjfqhznevlffgkbasgks.supabase.co";
const SUPABASE_KEY = "sb_publishable_MF11AGREWlKRo36W5v3AjA_dWobnP5c";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

function LoginPage() {
  const { login, authenticated, user } = usePrivy();
  const [nexBalance, setNexBalance] = useState("Loading...");

  useEffect(() => {
    async function loadNexBalance() {
      try {
        if (!authenticated || !user?.wallet?.address || !window.ethereum) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const token = new ethers.Contract(NEX_TOKEN_ADDRESS, ERC20_ABI, provider);

        const decimals = await token.decimals();
        const rawBalance = await token.balanceOf(user.wallet.address);
        const formatted = ethers.formatUnits(rawBalance, decimals);

        setNexBalance(
          Number(formatted).toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })
        );
      } catch (error) {
        console.error("Error loading NEX balance:", error);
        setNexBalance("Unable to load");
      }
    }

    loadNexBalance();
  }, [authenticated, user?.wallet?.address]);

  async function handleRewardCheckIn() {
    if (!user?.wallet?.address) {
      alert("Please connect your wallet first.");
      return;
    }

    const { error } = await supabase.from("reward_checkins").insert([
      {
        wallet_address: user.wallet.address,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      alert("Error saving reward check-in. Please try again.");
      return;
    }

    alert(
      "💜 Purple Wave Reward Check-In\n\nYour wallet has been successfully registered for future Nexora holder rewards. 🚀"
    );
  }

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
        textAlign: "center",
        padding: "40px",
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

          <p style={{ fontSize: "20px", marginBottom: "25px", color: "#cfcfcf" }}>
            {user?.wallet?.address}
          </p>

          <div
            style={{
              background: "#111827",
              border: "1px solid #8b5cf6",
              borderRadius: "18px",
              padding: "24px 40px",
              marginBottom: "35px",
              minWidth: "320px",
            }}
          >
            <p style={{ color: "#cfcfcf", marginBottom: "8px" }}>
              Live NEX Balance
            </p>
            <h2 style={{ fontSize: "36px", margin: 0, color: "#8b5cf6" }}>
              {nexBalance} NEX
            </h2>
          </div>

          <div
            onClick={handleRewardCheckIn}
            style={{
              background: "linear-gradient(135deg, #1f1137, #111827)",
              border: "1px solid #8b5cf6",
              borderRadius: "18px",
              padding: "22px 36px",
              marginBottom: "30px",
              minWidth: "320px",
              boxShadow: "0 0 25px rgba(139, 92, 246, 0.25)",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            <h2 style={{ margin: "0 0 8px 0", fontSize: "30px" }}>
              💜 Purple Wave Reward Check-In
            </h2>

            <p style={{ margin: 0, color: "#cfcfcf", fontSize: "18px" }}>
              Register for future Nexora holder rewards.
            </p>
          </div>

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
