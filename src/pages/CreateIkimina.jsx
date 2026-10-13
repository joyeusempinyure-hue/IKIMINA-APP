
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateIkimina() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("6");
  const [members, setMembers] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !name.trim() ||
      !amount ||
      !frequency ||
      !startDate ||
      !duration ||
      !members
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      alert("Contribution must be greater than 0.");
      return;
    }

    if (
      !Number.isInteger(Number(members)) ||
      Number(members) < 2
    ) {
      alert("IKIMINA igomba kugira nibura abanyamuryango 2.");
      return;
    }

    if (
      !Number.isInteger(Number(duration)) ||
      Number(duration) < 1
    ) {
      alert("Hitamo igihe cy'ikimina cyemewe.");
      return;
    }

    // Kugenzura ko itariki ari yo.
    const selectedDate = new Date(`${startDate}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      alert("Hitamo itariki yo gutangira ikimina yemewe.");
      return;
    }

    let savedUser;

    try {
      savedUser = JSON.parse(
        localStorage.getItem("ikiminaUser") || "null"
      );
    } catch {
      savedUser = null;
    }

    if (!savedUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    let settlementHistory = [];

    try {
      const savedHistory = JSON.parse(
        localStorage.getItem("ikiminaSettlementHistory") || "[]"
      );

      if (Array.isArray(savedHistory)) {
        settlementHistory = savedHistory;
      }
    } catch {
      alert(
        "Settlement History ntisomeka neza. Banza ukemure icyo kibazo kugira ngo amateka yawe arindwe."
      );
      return;
    }
    const usedCodes = new Set();

    try {
      const currentIkimina = JSON.parse(
        localStorage.getItem("ikiminaData") || "null"
      );

      if (currentIkimina?.code) {
        usedCodes.add(String(currentIkimina.code));
      }
    } catch {
    }

    settlementHistory.forEach((settlement) => {
      if (settlement?.ikiminaCode) {
        usedCodes.add(String(settlement.ikiminaCode));
      }
    });

    let code = "";
    let attempts = 0;

    do {
      code =
        "IKIMINA" +
        Math.floor(1000 + Math.random() * 9000);

      attempts += 1;
    } while (usedCodes.has(code) && attempts < 100);

    if (usedCodes.has(code)) {
      alert("Ntibyashobotse gukora code nshya. Ongera ugerageze.");
      return;
    }

    const now = Date.now();
    const ikimina = {
      id: now,
      name: name.trim(),
      amount: Number(amount),
      frequency,
      startDate,
      duration: Number(duration),
      members: Number(members),
      code,
      createdBy: savedUser.email,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const creator = {
      id: now + 1,
      name: savedUser.fullName || savedUser.name || "Ikimina Creator",
      email: savedUser.email || "",
      phone: savedUser.phone || "",
    };

    const keysToSave = [
      ["ikiminaData", JSON.stringify(ikimina)],
      ["ikiminaMembers", JSON.stringify([creator])],
      ["ikiminaContributions", JSON.stringify([])],
      ["ikiminaLoans", JSON.stringify([])],
      ["ikiminaCurrentTurn", JSON.stringify(0)],
      ["ikiminaSettled", JSON.stringify(false)],
    ];

    const previousValues = {};

    [
      ...keysToSave.map(([key]) => key),
      "ikiminaSettlementCurrent",
    ].forEach((key) => {
      previousValues[key] = localStorage.getItem(key);
    });

    try {
      keysToSave.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      localStorage.removeItem("ikiminaSettlementCurrent");
    } catch {
      try {
        Object.entries(previousValues).forEach(([key, value]) => {
          if (value === null) {
            localStorage.removeItem(key);
          } else {
            localStorage.setItem(key, value);
          }
        });
      } catch {
      }

      alert(
        "Ikimina nticyabitswe. Reba umwanya uri muri browser yawe wongere ugerageze."
      );
      return;
    }

    alert(
      `IKIMINA cyawe cyakozwe neza!\n\n` +
        `Izina: ${ikimina.name}\n` +
        `Code: ${code}\n` +
        `Contribution: ${Number(amount).toLocaleString("en-US")} RWF\n\n` +
        "Iyi ni cycle nshya. Settlement History ya cycle zabanje iracyabitswe."
    );

    navigate("/dashboard");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Create New Ikimina</h1>
          <p>Tangiza cycle nshya ya IKIMINA.</p>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <div
        className="dashboard-section"
        style={{ marginTop: 30 }}
      >
        <h2>Ikimina Information</h2>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 25,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 20,
          }}
        >
          <div>
            <label htmlFor="ikimina-name">Ikimina Name</label>
            <input
              id="ikimina-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Urugero: Abahuje Intego"
              required
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label htmlFor="ikimina-amount">
              Contribution Amount (RWF)
            </label>
            <input
              id="ikimina-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="5000"
              min="1"
              required
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label htmlFor="ikimina-frequency">Frequency</label>
            <select
              id="ikimina-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label htmlFor="ikimina-start-date">Start Date</label>
            <input
              id="ikimina-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label htmlFor="ikimina-duration">Duration</label>
            <select
              id="ikimina-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            >
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="24">24 Months</option>
              <option value="36">36 Months</option>
            </select>
          </div>

          <div>
            <label htmlFor="ikimina-members">Planned Members</label>
            <input
              id="ikimina-members"
              type="number"
              value={members}
              onChange={(e) => setMembers(e.target.value)}
              placeholder="10"
              min="2"
              step="1"
              required
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 10,
            }}
          >
            <button
              type="submit"
              className="dashboard-action-btn"
            >
              Create New Ikimina
            </button>
          </div>
        </form>
      </div>

      <div
        className="dashboard-section"
        style={{
          marginTop: 30,
          textAlign: "center",
        }}
      >
        <h2>🔄 New Cycle</h2>

        <p style={{ marginTop: 15, lineHeight: 1.8 }}>
          Iyo utangiye cycle nshya, contributions na loans bya
          cycle ishaje ntibivangwa n'ibya cycle nshya. Ikimina
          gishya gitangira gifite status ya settlement itarangiye.
          Settlement History ya cycle zashize iragumana amakuru
          yayo kugira ngo amateka ya IKIMINA atazimira.
        </p>
      </div>
    </div>
  );
}

export default CreateIkimina;

