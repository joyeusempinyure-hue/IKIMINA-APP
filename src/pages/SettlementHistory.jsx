
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SettlementHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const savedHistory = JSON.parse(
        localStorage.getItem("ikiminaSettlementHistory") || "[]"
      );

      if (!Array.isArray(savedHistory)) {
        setHistory([]);
        return;
      }
      const uniqueHistory = [];
      const seenIds = new Set();

      savedHistory.forEach((settlement, index) => {
        if (!settlement || typeof settlement !== "object") return;

        const id =
          settlement.id ??
          `${settlement.ikiminaName || "IKIMINA"}-${settlement.date || ""}-${index}`;

        if (seenIds.has(String(id))) return;

        seenIds.add(String(id));
        uniqueHistory.push(settlement);
      });

      setHistory(uniqueHistory);
    } catch {
      setHistory([]);
    }
  }, []);

  const formatAmount = (amount) =>
    `${Math.round(Number(amount) || 0).toLocaleString("en-US")} RWF`;

  const getMembers = (settlement) =>
    Array.isArray(settlement.members) ? settlement.members : [];

  const getContribution = (member) =>
    Number(member.contribution || 0);

  const getInterestShare = (member) =>
    Number(member.interestShare || 0);

  const getTotalShare = (member) =>
    Number(
      member.totalShare ??
        getContribution(member) + getInterestShare(member)
    );

  const sortedHistory = [...history].reverse();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Settlement History 📋</h1>
          <p>
            Amateka y'ibimina byamaze guseswa n'uko amafaranga
            yagabanyijwe ku banyamuryango.
          </p>
        </div>

        <button
          type="button"
          className="logout-btn"
          onClick={() => navigate("/dashboard")}
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

      {history.length === 0 ? (
        <div
          className="dashboard-section"
          style={{
            marginTop: 30,
            textAlign: "center",
            padding: "50px 20px",
          }}
        >
          <h2>Nta Settlement History iraboneka.</h2>

          <p style={{ marginTop: 10 }}>
            Amateka azagaragara hano nyuma yo gusesa ikimina.
          </p>

          <button
            type="button"
            className="dashboard-action-btn"
            style={{ marginTop: 20 }}
            onClick={() => navigate("/settlement")}
          >
            Go to Settlement
          </button>
        </div>
      ) : (
        <div
          className="dashboard-section"
          style={{ marginTop: 30 }}
        >
          <h2>Completed IKIMINA Cycles</h2>

          <p style={{ marginTop: 8, marginBottom: 25 }}>
            Buri cycle igaragaza amafaranga yayo n'abanyamuryango
            bayagabanye. Amakuru agaragara rimwe kuri buri settlement.
          </p>

          {sortedHistory.map((settlement, index) => {
            const members = getMembers(settlement);

            const contributions = Number(
              settlement.totalContributions || 0
            );

            const interest = Number(
              settlement.totalInterest || 0
            );

            const fund = Number(
              settlement.totalFund ?? contributions + interest
            );

            const memberCount = Number(
              settlement.memberCount ?? members.length
            );

            const settlementKey =
              settlement.id ??
              `${settlement.ikiminaName || "IKIMINA"}-${settlement.date || ""}-${index}`;

            return (
              <section
                key={settlementKey}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 24,
                  marginBottom: 25,
                  background: "#fff",
                  boxSizing: "border-box",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    flexWrap: "wrap",
                    marginBottom: 22,
                  }}
                >
                  <div>
                    <h2>
                      {settlement.ikiminaName || "IKIMINA"}
                    </h2>

                    <p style={{ marginTop: 7 }}>
                      <strong>Settlement Date:</strong>{" "}
                      {settlement.date || "-"}
                    </p>

                    <p style={{ marginTop: 5 }}>
                      <strong>Members:</strong> {memberCount}
                    </p>
                  </div>

                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 14px",
                      borderRadius: 20,
                      background: "#dcfce7",
                      color: "#166534",
                      fontWeight: 700,
                    }}
                  >
                    ✓ Settled
                  </span>
                </div>

               
                <div
                  className="dashboard-cards"
                  style={{ marginBottom: 25 }}
                >
                  <div className="dashboard-card">
                    <h3>Total Contributions</h3>
                    <p>{formatAmount(contributions)}</p>
                  </div>

                  <div className="dashboard-card">
                    <h3>Total Interest</h3>
                    <p>{formatAmount(interest)}</p>
                  </div>

                  <div className="dashboard-card">
                    <h3>Total Fund</h3>
                    <p>{formatAmount(fund)}</p>
                  </div>
                </div>

                <h3 style={{ marginBottom: 15 }}>
                  Member Distribution 💰
                </h3>

                {members.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table>
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Member</th>
                          <th>Member ID</th>
                          <th>Contribution</th>
                          <th>Interest Share</th>
                          <th>Total Share</th>
                        </tr>
                      </thead>

                      <tbody>
                        {members.map((member, memberIndex) => (
                          <tr
                            key={
                              member.memberId ??
                              `${settlementKey}-member-${memberIndex}`
                            }
                          >
                            <td>{memberIndex + 1}</td>

                            <td>
                              <strong>
                                {member.memberName || "Unknown Member"}
                              </strong>
                            </td>

                            <td>{member.memberId ?? "N/A"}</td>

                            <td>
                              {formatAmount(getContribution(member))}
                            </td>

                            <td>
                              {formatAmount(getInterestShare(member))}
                            </td>

                            <td>
                              <strong>
                                {formatAmount(getTotalShare(member))}
                              </strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>
                    Nta makuru y'uko amafaranga yagabanyijwe
                    ku banyamuryango yabitswe kuri iyi cycle.
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}

      <div
        style={{
          marginTop: 30,
          marginBottom: 20,
          display: "flex",
          justifyContent: "center",
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="dashboard-action-btn"
          onClick={() => navigate("/settlement")}
        >
          Current Settlement
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/create-ikimina")}
        >
          🔄 Create New IKIMINA
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}

export default SettlementHistory;

