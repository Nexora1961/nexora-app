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
        background: "rgba(17, 24, 39, 0.92)",
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
function AdminPanel() {
  const [ambassadors, setAmbassadors] = useState([]);
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    async function loadAdminData() {
      const { data: ambassadorData } = await supabase
        .from("ambassador_applications")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: rewardData } = await supabase
        .from("reward_checkins")
        .select("*")
        .order("created_at", { ascending: false });

      setAmbassadors(ambassadorData || []);
      setRewards(rewardData || []);
    }

    loadAdminData();
  }, []);

  return (
    <Card border="#facc15">
      <h2>🛡️ Admin Dashboard</h2>
      <p style={{ color: "#cfcfcf" }}>
        Review ambassador applications and reward registrations.
      </p>

      <h3>🌟 Ambassador Applications</h3>
      {ambassadors.map((item) => (
        <div key={item.id} style={{ borderTop: "1px solid #374151", padding: "12px 0" }}>
          <p style={{ margin: 0 }}>{item.wallet_address}</p>
          <p style={{ color: "#facc15", margin: "6px 0 0" }}>Status: {item.status}</p>
        </div>
      <p style={{ color: "#facc15", margin: "6px 0 0" }}>
  Status: {item.status}
</p>

<div style={{ marginTop: "12px", display: "flex", gap: "10px" }}>
  <button
    onClick={async () => {
      await supabase
        .from("ambassador_applications")
        .update({ status: "approved" })
        .eq("id", item.id);

      alert("Ambassador approved 💜");
      window.location.reload();
    }}
    style={{
      background: "#22c55e",
      color: "white",
      border: "none",
      padding: "10px 18px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Approve
  </button>

  <button
    onClick={async () => {
      await supabase
        .from("ambassador_applications")
        .update({ status: "rejected" })
        .eq("id", item.id);

      alert("Ambassador rejected");
      window.location.reload();
    }}
    style={{
      background: "#ef4444",
      color: "white",
      border: "none",
      padding: "10px 18px",
      borderRadius: "10px",
      cursor: "pointer",
      fontWeight: "bold",
    }}
  >
    Reject
  </button>
</div>

</div>
      ))}

      <h3 style={{ marginTop: "28px" }}>💜 Reward Check-Ins</h3>
      {rewards.map((item) => (
        <div key={item.id} style={{ borderTop: "1px solid #374151", padding: "12px 0" }}>
          <p style={{ margin: 0 }}>{item.wallet_address}</p>
          <p style={{ color: "#22c55e", margin: "6px 0 0" }}>Status: {item.status}</p>
        </div>
      ))}
    </Card>
  );
}
function LoginPage() {
  const { login, authenticated, user, logout } = usePrivy();

  const [nexBalance, setNexBalance] = useState("Loading...");
  const [rewardStatus, setRewardStatus] = useState("Checking...");
  const [ambassadorStatus, setAmbassadorStatus] = useState("Not Applied");
  const [holderTier, setHolderTier] = useState("Loading...");
  const [rank, setRank] = useState("Starter");
  const [xp, setXp] = useState(0);
  const [balanceNumber, setBalanceNumber] = useState(0);

  const walletAddress = user?.wallet?.address;

  const isAdmin =
    walletAddress?.toLowerCase() ===
    "0x3645a56ad01642c2ee7fa8ab301cea09f107e2f2";

  function calculateRank(balance, registered, ambassador) {
    let points = 0;

    if (balance >= 100) points += 100;
    if (balance >= 500) points += 300;
    if (balance >= 5000) points += 1000;
    if (registered) points += 250;
    if (ambassador === "pending") points += 500;
    if (ambassador === "approved") points += 1500;

    setXp(points);

    if (points >= 3000) setRank("🛡️ Guardian");
    else if (points >= 2000) setRank("🌟 Elite Ambassador");
    else if (points >= 1200) setRank("💜 Ambassador");
    else if (points >= 700) setRank("🔥 Core Holder");
    else if (points >= 300) setRank("💜 Wave Holder");
    else setRank("Starter");
  }

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
          numericBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })
        );

        let tier = "Starter";
        if (numericBalance >= 5000) tier = "🔥 Core Holder";
        else if (numericBalance >= 500) tier = "💜 Wave Holder";
        setHolderTier(tier);

        const { data: rewardData } = await supabase
          .from("reward_checkins")
          .select("status")
          .eq("wallet_address", walletAddress)
          .limit(1);

        const registered = rewardData && rewardData.length > 0;

        if (registered) setRewardStatus(rewardData[0].status);
        else setRewardStatus("Not Registered");

        const { data: ambassadorData } = await supabase
          .from("ambassador_applications")
          .select("status")
          .eq("wallet_address", walletAddress)
          .limit(1);

        let ambassador = "not_applied";

        if (ambassadorData && ambassadorData.length > 0) {
          ambassador = ambassadorData[0].status;
          setAmbassadorStatus(ambassadorData[0].status);
        } else {
          setAmbassadorStatus("Not Applied");
        }

        calculateRank(numericBalance, registered, ambassador);
      } catch (error) {
        console.error("Load data error:", error);
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
        alert("You are already registered for rewards. ✅");
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
      alert("Wallet successfully registered for future Nexora rewards. 💜");
    } catch (error) {
      console.error(error);
      alert("Registration failed.");
    }
  }

  async function handleAmbassadorApply() {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      const { data: existing } = await supabase
        .from("ambassador_applications")
        .select("status")
        .eq("wallet_address", walletAddress)
        .limit(1);

      if (existing && existing.length > 0) {
        setAmbassadorStatus(existing[0].status);
        alert("You already applied for the Ambassador Program. ✅");
        return;
      }

      const { error } = await supabase.from("ambassador_applications").insert([
        {
          wallet_address: walletAddress,
          status: "pending",
        },
      ]);

      if (error) {
        console.error(error);
        alert("Ambassador table may need to be created in Supabase first.");
        return;
      }

      setAmbassadorStatus("pending");
      alert("Ambassador application submitted successfully. 💜");
    } catch (error) {
      console.error(error);
      alert("Application failed.");
    }
  }

  const waveProgress = Math.min((balanceNumber / 500) * 100, 100);
  const coreProgress = Math.min((balanceNumber / 5000) * 100, 100);
  const xpProgress = Math.min((xp / 3000) * 100, 100);

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
          <div>
            <h1 style={{ margin: 0, fontSize: "38px", color: "#8b5cf6" }}>
              NEXORA
            </h1>
            <p style={{ margin: "6px 0 0", color: "#cfcfcf" }}>
              Advanced Ecosystem Portal
            </p>
          </div>

          {authenticated && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <span
                style={{
                  border: "1px solid #8b5cf6",
                  borderRadius: "999px",
                  padding: "10px 14px",
                  color: "#cfcfcf",
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
              <h2 style={{ fontSize: "48px", marginTop: 0 }}>
                Nexora Wallet Login
              </h2>
              <p style={{ color: "#cfcfcf", fontSize: "20px", lineHeight: 1.6 }}>
                Connect your wallet to access holder tiers, XP, rewards,
                ambassador status, and ecosystem tools.
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
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <Card glow>
                <p style={{ color: "#cfcfcf", margin: 0 }}>Wallet Connected ✅</p>
                <h2 style={{ color: "#8b5cf6", fontSize: "34px" }}>
                  Nexora Dashboard
                </h2>
                <p style={{ color: "#cfcfcf", wordBreak: "break-all" }}>
                  {walletAddress}
                </p>
              </Card>

              <Card border="#22c55e">
                <p style={{ color: "#cfcfcf", margin: 0 }}>Reward Status</p>
                <h2 style={{ color: "#22c55e", fontSize: "34px" }}>
                  {rewardStatus}
                </h2>
              </Card>

              <Card border="#facc15">
                <p style={{ color: "#cfcfcf", margin: 0 }}>Ambassador Status</p>
                <h2 style={{ color: "#facc15", fontSize: "34px" }}>
                  {ambassadorStatus}
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
                <p style={{ color: "#cfcfcf" }}>Live NEX Balance</p>
                <h2 style={{ color: "#8b5cf6", fontSize: "34px" }}>
                  {nexBalance} NEX
                </h2>
              </Card>

              <Card>
                <p style={{ color: "#cfcfcf" }}>Holder Tier</p>
                <h2 style={{ color: "#8b5cf6", fontSize: "34px" }}>
                  {holderTier}
                </h2>
              </Card>

              <Card>
                <p style={{ color: "#cfcfcf" }}>Nexora Rank</p>
                <h2 style={{ color: "#8b5cf6", fontSize: "34px" }}>{rank}</h2>
              </Card>

              <Card>
                <p style={{ color: "#cfcfcf" }}>XP Points</p>
                <h2 style={{ color: "#8b5cf6", fontSize: "34px" }}>{xp} XP</h2>
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
                <h2>💜 Wave Holder Progress</h2>
                <p style={{ color: "#cfcfcf" }}>500+ NEX holder tier</p>
                <div style={{ height: "12px", background: "#1f2937", borderRadius: "999px" }}>
                  <div style={{ width: `${waveProgress}%`, height: "100%", background: "#8b5cf6", borderRadius: "999px" }} />
                </div>
              </Card>

              <Card>
                <h2>🔥 Core Holder Progress</h2>
                <p style={{ color: "#cfcfcf" }}>5,000+ NEX holder tier</p>
                <div style={{ height: "12px", background: "#1f2937", borderRadius: "999px" }}>
                  <div style={{ width: `${coreProgress}%`, height: "100%", background: "#8b5cf6", borderRadius: "999px" }} />
                </div>
              </Card>

              <Card>
                <h2>🛡️ Rank Progress</h2>
                <p style={{ color: "#cfcfcf" }}>Progress toward Guardian rank</p>
                <div style={{ height: "12px", background: "#1f2937", borderRadius: "999px" }}>
                  <div style={{ width: `${xpProgress}%`, height: "100%", background: "#facc15", borderRadius: "999px" }} />
                </div>
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
          <Card glow>
  <h2>💜 Register for Rewards</h2>

  <p style={{ color: "#cfcfcf" }}>
    Register your wallet for future Nexora holder rewards.
  </p>

  <button
    onClick={handleRewardCheckIn}
    style={{
      marginTop: "18px",
      background: "#8b5cf6",
      color: "white",
      border: "none",
      padding: "14px 24px",
      borderRadius: "14px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    }}
  >
    Register Now
  </button>
</Card>

         <Card border="#facc15" glow>
  <h2>🌟 Apply as Ambassador</h2>
  <p style={{ color: "#cfcfcf" }}>
    Apply to become part of Nexora’s community growth team.
  </p>

  <button
    onClick={handleAmbassadorApply}
    style={{
      marginTop: "18px",
      background: "#facc15",
      color: "#111827",
      border: "none",
      padding: "14px 24px",
      borderRadius: "14px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
    }}
  >
    Apply Now
  </button>
</Card>
            </section>

            <Card>
              <h2>Advanced Nexora Role System</h2>
              <section
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
    marginTop: "24px",
    marginBottom: "24px",
  }}
>
  <Card border="#facc15">
    <h2>🚧 Daily XP Check-Ins</h2>
    <p style={{ color: "#cfcfcf", lineHeight: 1.6 }}>
      Earn bonus XP through daily ecosystem activity and community participation.
    </p>
    <p style={{ color: "#facc15", fontWeight: "bold" }}>
      Under Development
    </p>
  </Card>

  <Card border="#22c55e">
    <h2>🏆 Leaderboards</h2>
    <p style={{ color: "#cfcfcf", lineHeight: 1.6 }}>
      Compete with other holders, ambassadors, and top community contributors.
    </p>
    <p style={{ color: "#22c55e", fontWeight: "bold" }}>
      Coming Soon
    </p>
  </Card>

  <Card border="#8b5cf6">
    <h2>🎮 Zealy & Galxe Sync</h2>
    <p style={{ color: "#cfcfcf", lineHeight: 1.6 }}>
      Sync community quests, campaigns, and XP progression directly into Nexora.
    </p>
    <p style={{ color: "#8b5cf6", fontWeight: "bold" }}>
      In Development
    </p>
  </Card>

  <Card border="#38bdf8">
    <h2>🛡️ Guardian Access</h2>
    <p style={{ color: "#cfcfcf", lineHeight: 1.6 }}>
      Unlock special ecosystem privileges, future rewards, and exclusive access.
    </p>
    <p style={{ color: "#38bdf8", fontWeight: "bold" }}>
      Future Feature
    </p>
  </Card>
</section>
              <p style={{ color: "#cfcfcf", lineHeight: 1.7 }}>
                Roles are based on NEX balance, wallet registration, XP, and
                ambassador status. Future upgrades can include Zealy, Galxe,
                referrals, Discord activity, and manual admin approval.
              </p>
              <p style={{ color: "#cfcfcf" }}>
                Starter → Wave Holder → Core Holder → Ambassador → Elite
                Ambassador → Guardian
              </p>
            </Card>

          {isAdmin && (
  <div style={{ marginTop: "24px" }}>
    <AdminPanel />
  </div>
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




