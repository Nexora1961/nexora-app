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
];

function shortWallet(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function Card({ children, border = "#8b5cf6", glow = false, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(17, 24, 39, 0.9)",
        border: `1px solid ${border}`,
        borderRadius: "26px",
        padding: "28px",
        boxShadow: glow ? `0 0 35px ${border}33` : "none",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {children}
    </div>
  );
}

function LoginPage() {
  const { login, authenticated, user, logout } = usePrivy();

  const [nexBalance, setNexBalance] = useState("Loading...");
  const [rewardStatus, setRewardStatus] = useState("Checking...");
  const [holderTier, setHolderTier] = useState("Loading...");
  const [balanceNumber, setBalanceNumber] = useState(0);

  const walletAddress = user?.wallet?.address;

  const isAdmin =
    walletAddress?.toLowerCase() ===
    "0x3645a56ad01642c2ee7fa8ab301cea09f107e2f2";

  useEffect(() => {
    async function loadData() {
      try {
        if (!authenticated || !walletAddress || !window.ethereum) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const token = new ethers.Contract(NEX_TOKEN_ADDRESS, ERC20_ABI, provider);

        const decimals = await token.decimals();
        const rawBalance = await token.balanceOf(walletAddress);
        const formatted = ethers.formatUnits(rawBalance, decimals);
        const numericBalance = Number(formatted);

        setBalanceNumber(numericBalance);

        setNexBalance(
          numericBalance.toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })
        );

        if (numericBalance >= 5000) {
          setHolderTier("🔥 Core Holder");
        } else if (numericBalance >= 500) {
          setHolderTier("💜 Wave Holder");
        } else {
          setHolderTier("Starter");
        }

        const { data } = await supabase
          .from("reward_checkins")
          .select("status")
          .eq("wallet_address", walletAddress)
          .limit(1);

        if (data && data.length > 0) {
          setRewardStatus(data[0].status);
        } else {
          setRewardStatus("Not Registered");
        }
      } catch (error) {
        console.error("Load data error:", error);
        setNexBalance("Error");
        setRewardStatus("Error");
        setHolderTier("Error");
      }
    }

    loadData();
  }, [authenticated, walletAddress]);

  async function handleRewardCheckIn() {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const { data: existing } = await supabase
        .from("reward_checkins")
        .select("status")
        .eq("wallet_address", walletAddress)
        .limit(1);

      if (existing && existing.length > 0) {
        setRewardStatus(existing[0].status);
        alert("💜 Purple Wave Reward Check-In\n\nYou are already registered. ✅");
        return;
      }

      const { error } = await supabase.from("reward_checkins").insert([
        {
          wallet_address: walletAddress,
          status: "pending",
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        alert("Error saving reward check-in.");
        return;
      }

      setRewardStatus("pending");
      alert(
        "💜 Purple Wave Reward Check-In\n\nYour wallet has been successfully registered for future Nexora holder rewards. 🚀"
      );
    } catch (error) {
      console.error("Reward check-in error:", error);
      alert("Registration failed. Please try again.");
    }
  }

  const waveProgress = Math.min((balanceNumber / 500) * 100, 100);
  const coreProgress = Math.min((balanceNumber / 5000) * 100, 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(139,92,246,0.35), transparent 28%), radial-gradient(circle at bottom left, rgba(34,197,94,0.12), transparent 25%), #050510",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "28px",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "42px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "18px",
                background: "linear-gradient(135deg, #8b5cf6, #3b0764)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                fontWeight: "bold",
                boxShadow: "0 0 28px rgba(139,92,246,0.45)",
              }}
            >
              N
            </div>

            <div>
              <h1 style={{ margin: 0, fontSize: "34px", color: "#8b5cf6" }}>
                NEXORA
              </h1>
              <p style={{ margin: "5px 0 0", color: "#cfcfcf" }}>
                Ecosystem Portal
              </p>
            </div>
          </div>

          {authenticated && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span
                style={{
                  border: "1px solid #8b5cf6",
                  borderRadius: "999px",
                  padding: "10px 14px",
                  color: "#cfcfcf",
                  fontSize: "14px",
                }}
              >
                {shortWallet(walletAddress)}
              </span>

              <button
                onClick={logout}
                style={{
                  background: "transparent",
                  border: "1px solid #8b5cf6",
                  color: "white",
                  padding: "11px 18px",
                  borderRadius: "14px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Disconnect
              </button>
            </div>
          )}
        </header>

        {!authenticated ? (
          <section
            style={{
              minHeight: "70vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Card glow>
              <h2 style={{ fontSize: "48px", margin: "0 0 18px" }}>
                Nexora Wallet Login
              </h2>

              <p
                style={{
                  color: "#cfcfcf",
                  fontSize: "20px",
                  lineHeight: 1.55,
                  marginBottom: "36px",
                }}
              >
                Connect your wallet to access live NEX balance tracking, holder
                tiers, reward registration, and ecosystem tools.
              </p>

              <button
                onClick={login}
                style={{
                  background: "#8b5cf6",
                  border: "none",
                  color: "white",
                  padding: "18px 44px",
                  borderRadius: "16px",
                  fontSize: "22px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  boxShadow: "0 0 24px rgba(139,92,246,0.45)",
                }}
              >
                Connect Wallet
              </button>
            </Card>
          </section>
        ) : (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <Card glow>
                <p style={{ margin: 0, color: "#cfcfcf" }}>
                  Wallet Connected ✅
                </p>
                <h2 style={{ margin: "14px 0", fontSize: "38px", color: "#8b5cf6" }}>
                  Nexora Dashboard
                </h2>
                <p style={{ margin: 0, color: "#cfcfcf", wordBreak: "break-all" }}>
                  {walletAddress}
                </p>
              </Card>

              <Card border="#22c55e">
                <p style={{ margin: 0, color: "#cfcfcf" }}>Reward Status</p>
                <h2
                  style={{
                    margin: "16px 0 0",
                    color: "#22c55e",
                    fontSize: "36px",
                    textTransform: "capitalize",
                  }}
                >
                  {rewardStatus}
                </h2>
              </Card>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <Card>
                <p style={{ color: "#cfcfcf", margin: 0 }}>Live NEX Balance</p>
                <h2 style={{ color: "#8b5cf6", fontSize: "34px", margin: "14px 0 0" }}>
                  {nexBalance} NEX
                </h2>
              </Card>

              <Card>
                <p style={{ color: "#cfcfcf", margin: 0 }}>Holder Tier</p>
                <h2 style={{ color: "#8b5cf6", fontSize: "34px", margin: "14px 0 0" }}>
                  {holderTier}
                </h2>
              </Card>

              <Card onClick={handleRewardCheckIn} glow>
                <p style={{ color: "#cfcfcf", margin: 0 }}>Rewards</p>
                <h2 style={{ color: "white", fontSize: "30px", margin: "14px 0 8px" }}>
                  💜 Register Wallet
                </h2>
                <p style={{ color: "#cfcfcf", margin: 0 }}>
                  Register for future holder rewards.
                </p>
              </Card>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <Card>
                <h2 style={{ marginTop: 0 }}>💜 Wave Holder Progress</h2>
                <p style={{ color: "#cfcfcf" }}>500+ NEX holder tier</p>
                <div style={{ height: "12px", background: "#1f2937", borderRadius: "999px" }}>
                  <div
                    style={{
                      width: `${waveProgress}%`,
                      height: "100%",
                      background: "#8b5cf6",
                      borderRadius: "999px",
                    }}
                  />
                </div>
              </Card>

              <Card>
                <h2 style={{ marginTop: 0 }}>🔥 Core Holder Progress</h2>
                <p style={{ color: "#cfcfcf" }}>5,000+ NEX holder tier</p>
                <div style={{ height: "12px", background: "#1f2937", borderRadius: "999px" }}>
                  <div
                    style={{
                      width: `${coreProgress}%`,
                      height: "100%",
                      background: "#8b5cf6",
                      borderRadius: "999px",
                    }}
                  />
                </div>
              </Card>
            </section>

            {isAdmin && (
              <Card border="#facc15">
                <h2 style={{ marginTop: 0 }}>🛡️ Admin Access</h2>
                <p style={{ color: "#cfcfcf" }}>
                  Admin wallet detected. Approval and reward management tools will be added here next.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
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





