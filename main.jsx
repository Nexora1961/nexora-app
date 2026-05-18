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

function LoginPage() {
  const { login, authenticated, user, logout } = usePrivy();

  const [nexBalance, setNexBalance] = useState("Loading...");
  const [rewardStatus, setRewardStatus] = useState("Checking...");
  const [holderTier, setHolderTier] = useState("Loading...");

  const walletAddress = user?.wallet?.address;

  useEffect(() => {
    async function loadData() {
      try {
        if (!authenticated || !walletAddress || !window.ethereum) return;

        const provider = new ethers.BrowserProvider(window.ethereum);
        const token = new ethers.Contract(NEX_TOKEN_ADDRESS, ERC20_ABI, provider);

        const decimals = await token.decimals();
        const rawBalance = await token.balanceOf(walletAddress);
        const formatted = ethers.formatUnits(rawBalance, decimals);
        const balanceNumber = Number(formatted);

        setNexBalance(
          balanceNumber.toLocaleString(undefined, {
            maximumFractionDigits: 4,
          })
        );

        if (balanceNumber >= 5000) {
          setHolderTier("🔥 Core Holder");
        } else if (balanceNumber >= 500) {
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
        console.error(error);
      }
    }

    loadData();
  }, [authenticated, walletAddress]);

  async function handleRewardCheckIn() {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

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
      console.error(error);
      alert("Error saving reward check-in.");
      return;
    }

    setRewardStatus("pending");
    alert(
      "💜 Purple Wave Reward Check-In\n\nYour wallet has been successfully registered for future Nexora holder rewards. 🚀"
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(139,92,246,0.25), transparent 30%), #050510",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "28px",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "50px",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "34px",
                color: "#8b5cf6",
                letterSpacing: "1px",
              }}
            >
              NEXORA
            </h1>
            <p style={{ margin: "6px 0 0", color: "#cfcfcf" }}>
              Ecosystem Portal
            </p>
          </div>

          {authenticated ? (
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid #8b5cf6",
                color: "white",
                padding: "12px 20px",
                borderRadius: "14px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Disconnect
            </button>
          ) : null}
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
            <div
              style={{
                background: "rgba(17, 24, 39, 0.85)",
                border: "1px solid #8b5cf6",
                borderRadius: "28px",
                padding: "50px",
                maxWidth: "650px",
                boxShadow: "0 0 50px rgba(139,92,246,0.2)",
              }}
            >
              <h2 style={{ fontSize: "54px", margin: "0 0 20px" }}>
                Nexora Wallet Login
              </h2>
              <p
                style={{
                  color: "#cfcfcf",
                  fontSize: "22px",
                  lineHeight: 1.5,
                  marginBottom: "35px",
                }}
              >
                Connect your wallet to access live NEX balance tracking,
                rewards, holder tiers, and ecosystem tools.
              </p>
              <button
                onClick={login}
                style={{
                  background: "#8b5cf6",
                  border: "none",
                  color: "white",
                  padding: "18px 42px",
                  borderRadius: "16px",
                  fontSize: "22px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Connect Wallet
              </button>
            </div>
          </section>
        ) : (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 0.8fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "rgba(17, 24, 39, 0.88)",
                  border: "1px solid rgba(139,92,246,0.8)",
                  borderRadius: "28px",
                  padding: "34px",
                  boxShadow: "0 0 40px rgba(139,92,246,0.12)",
                }}
              >
                <p style={{ margin: 0, color: "#cfcfcf" }}>Wallet Connected ✅</p>
                <h2
                  style={{
                    margin: "14px 0",
                    fontSize: "42px",
                    color: "#8b5cf6",
                  }}
                >
                  Nexora Dashboard
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: "#cfcfcf",
                    wordBreak: "break-all",
                    fontSize: "16px",
                  }}
                >
                  {walletAddress}
                </p>
              </div>

              <div
                style={{
                  background: "rgba(17, 24, 39, 0.88)",
                  border: "1px solid rgba(34,197,94,0.8)",
                  borderRadius: "28px",
                  padding: "34px",
                }}
              >
                <p style={{ margin: 0, color: "#cfcfcf" }}>Reward Status</p>
                <h2
                  style={{
                    margin: "16px 0 0",
                    color: "#22c55e",
                    fontSize: "40px",
                    textTransform: "capitalize",
                  }}
                >
                  {rewardStatus}
                </h2>
              </div>
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "#111827",
                  border: "1px solid #8b5cf6",
                  borderRadius: "24px",
                  padding: "28px",
                }}
              >
                <p style={{ color: "#cfcfcf", margin: 0 }}>Live NEX Balance</p>
                <h2
                  style={{
                    color: "#8b5cf6",
                    fontSize: "34px",
                    margin: "14px 0 0",
                  }}
                >
                  {nexBalance} NEX
                </h2>
              </div>

              <div
                style={{
                  background: "#111827",
                  border: "1px solid #8b5cf6",
                  borderRadius: "24px",
                  padding: "28px",
                }}
              >
                <p style={{ color: "#cfcfcf", margin: 0 }}>Holder Tier</p>
                <h2
                  style={{
                    color: "#8b5cf6",
                    fontSize: "34px",
                    margin: "14px 0 0",
                  }}
                >
                  {holderTier}
                </h2>
              </div>

              <div
                onClick={handleRewardCheckIn}
                style={{
                  background: "linear-gradient(135deg, #251047, #111827)",
                  border: "1px solid #8b5cf6",
                  borderRadius: "24px",
                  padding: "28px",
                  cursor: "pointer",
                  boxShadow: "0 0 30px rgba(139,92,246,0.2)",
                }}
              >
                <p style={{ color: "#cfcfcf", margin: 0 }}>Rewards</p>
                <h2
                  style={{
                    color: "white",
                    fontSize: "28px",
                    margin: "14px 0 8px",
                  }}
                >
                  💜 Check-In
                </h2>
                <p style={{ color: "#cfcfcf", margin: 0 }}>
                  Register for future holder rewards.
                </p>
              </div>
            </section>

            <section
              style={{
                background: "rgba(17, 24, 39, 0.88)",
                border: "1px solid rgba(139,92,246,0.8)",
                borderRadius: "28px",
                padding: "34px",
                marginBottom: "24px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Purple Wave Holder Program</h2>
              <p style={{ color: "#cfcfcf", lineHeight: 1.6 }}>
                Holder tiers are based on live NEX balance in the connected
                wallet. Future rewards may require long-term holding and manual
                approval.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "18px",
                  marginTop: "22px",
                }}
              >
                <div
                  style={{
                    border: "1px solid rgba(139,92,246,0.7)",
                    borderRadius: "18px",
                    padding: "20px",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>💜 Wave Holder</h3>
                  <p style={{ color: "#cfcfcf", marginBottom: 0 }}>
                    500+ NEX holder tier.
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid rgba(139,92,246,0.7)",
                    borderRadius: "18px",
                    padding: "20px",
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>🔥 Core Holder</h3>
                  <p style={{ color: "#cfcfcf", marginBottom: 0 }}>
                    5,000+ NEX holder tier.
                  </p>
                </div>
              </div>
            </section>

            <div
              style={{
                display: "flex",
                gap: "18px",
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
