import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Settlement() {
  const navigate = useNavigate();

  const [ikimina, setIkimina] = useState(null);
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    const readStorage = (key, fallback) => {
      try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
      } catch {
        return fallback;
      }
    };

    const savedIkimina = readStorage("ikiminaData", null);
    const savedMembers = readStorage("ikiminaMembers", []);
    const savedContributions = readStorage(
      "ikiminaContributions",
      []
    );
    const savedLoans = readStorage("ikiminaLoans", []);
    const savedSettled = readStorage("ikiminaSettled", false);

    setIkimina(savedIkimina);
    setMembers(Array.isArray(savedMembers) ? savedMembers : []);
    setContributions(
      Array.isArray(savedContributions) ? savedContributions : []
    );
    setLoans(Array.isArray(savedLoans) ? savedLoans : []);
    setIsSettled(savedSettled === true);
  }, []);

  const formatMoney = (value) =>
    `${Math.round(Number(value) || 0).toLocaleString("en-US")} RWF`;

  const getMemberName = (member) =>
    member?.name || member?.fullName || "Unknown Member";

  const getInterest = (loan) =>
    Number(loan.interest ?? loan.interestAmount ?? 0);

  const getTotalToPay = (loan) =>
    Number(
      loan.totalToPay ??
        Number(loan.amount || 0) + getInterest(loan)
    );

  // Amafaranga yose abanyamuryango batanze.
  const totalContributions = contributions.reduce(
    (total, contribution) =>
      total + Number(contribution.amount || 0),
    0
  );

  const paidLoans = loans.filter(
    (loan) => loan.status === "Paid"
  );

  const pendingLoans = loans.filter(
    (loan) => loan.status !== "Paid"
  );

  const pendingLoanAmount = pendingLoans.reduce(
    (total, loan) => total + getTotalToPay(loan),
    0
  );

  // Inyungu zibarwa gusa ku nguzanyo zishyuwe.
  const totalInterest = paidLoans.reduce(
    (total, loan) => total + getInterest(loan),
    0
  );

  // Amafaranga abazwe: contributions + inyungu zishyuwe.
  const totalFund = totalContributions + totalInterest;

  // Umusanzu wa buri munyamuryango.
  const getMemberContribution = (member) => {
    return contributions
      .filter((contribution) => {
        const sameId =
          contribution.memberId != null &&
          member.id != null &&
          String(contribution.memberId) === String(member.id);

        const contributionName = String(
          contribution.memberName || ""
        )
          .trim()
          .toLowerCase();

        const memberName = String(getMemberName(member))
          .trim()
          .toLowerCase();

        const sameName =
          contributionName !== "" &&
          memberName !== "" &&
          contributionName === memberName;

        return sameId || sameName;
      })
      .reduce(
        (total, contribution) =>
          total + Number(contribution.amount || 0),
        0
      );
  };

  // Kugenzura igihe cyo gusesa ikimina.
  const isSettlementDue = () => {
    if (!ikimina?.startDate) return false;

    // Kugumana uburyo bwa kera niba duration itarabitswe.
    if (
      ikimina.duration === undefined ||
      ikimina.duration === null ||
      ikimina.duration === ""
    ) {
      return true;
    }

    const duration = Number(ikimina.duration);

    if (!Number.isFinite(duration) || duration < 1) {
      return false;
    }

    const startDate = new Date(
      `${ikimina.startDate}T00:00:00`
    );

    if (Number.isNaN(startDate.getTime())) return false;

    const settlementDate = new Date(startDate);
    settlementDate.setMonth(
      settlementDate.getMonth() + duration
    );

    return new Date() >= settlementDate;
  };

  const settlementDue = isSettlementDue();

  // Gusesa no kubika settlement.
  const handleSettlement = () => {
    // Soma status iri muri localStorage, atari state yonyine.
    let savedSettled = false;

    try {
      savedSettled =
        JSON.parse(
          localStorage.getItem("ikiminaSettled") || "false"
        ) === true;
    } catch {
      savedSettled = false;
    }

    if (isSettled || savedSettled) {
      setIsSettled(true);
      alert("Iki IKIMINA cyamaze guseswa.");
      return;
    }

    if (!ikimina) {
      alert("Nta IKIMINA kiboneka. Banza ukore ikimina.");
      return;
    }

    if (members.length === 0) {
      alert("Nta banyamuryango baboneka.");
      return;
    }

    if (!settlementDue) {
      alert(
        "Igihe cyo gusesa IKIMINA ntikiragera, cyangwa start date/duration ntibyuzuye."
      );
      return;
    }

    if (pendingLoans.length > 0) {
      alert(
        `Hari inguzanyo ${pendingLoans.length} zitarishyurwa. Banza uzikemure mbere yo gusesa IKIMINA.`
      );
      return;
    }

    let oldHistory = [];

    try {
      const savedHistory = JSON.parse(
        localStorage.getItem("ikiminaSettlementHistory") || "[]"
      );

      if (!Array.isArray(savedHistory)) {
        alert(
          "Settlement History ntabwo ibitse amakuru mu buryo bwemewe. Nta makuru yahinduwe."
        );
        return;
      }

      oldHistory = savedHistory;
    } catch {
      alert(
        "Settlement History ntisomeka neza. Nta makuru yahinduwe."
      );
      return;
    }

    // Niba ikimina gifite code, iyikoreshe mu kumenya cycle.
    // Ibi birinda kongera kubika cycle ifite code imwe.
    const ikiminaCode = ikimina.code
      ? String(ikimina.code)
      : null;

    const sameCycleAlreadySaved = oldHistory.some((item) => {
      if (!item || typeof item !== "object") return false;

      if (ikiminaCode && item.ikiminaCode) {
        return String(item.ikiminaCode) === ikiminaCode;
      }

      // Ku mateka ya kera adafite code, gereranya
      // izina, itariki yo gutangira n'itariki yo gusesa.
      return (
        item.ikiminaName === (ikimina.name || "IKIMINA") &&
        item.startDate === ikimina.startDate &&
        item.date === new Date().toISOString().split("T")[0]
      );
    });

    if (sameCycleAlreadySaved) {
      alert(
        "Settlement y'iki kimina isanzwe iri muri History. Ntabwo yongeye kubikwa."
      );
      return;
    }

    const membersSettlement = members.map((member, index) => {
      const contribution = getMemberContribution(member);

      // Kugabanya inyungu ku banyamuryango bose.
      const interestShare =
        Math.floor(totalInterest / members.length) +
        (index < totalInterest % members.length ? 1 : 0);

      return {
        memberId: member.id ?? null,
        memberName: getMemberName(member),
        contribution,
        interestShare,
        totalShare: contribution + interestShare,
      };
    });

    const settlement = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      ikiminaName: ikimina.name || "IKIMINA",
      ikiminaCode,
      startDate: ikimina.startDate || null,
      date: new Date().toISOString().split("T")[0],
      totalContributions,
      totalInterest,
      totalFund,
      pendingLoans: 0,
      memberCount: members.length,
      members: membersSettlement,
    };

    // Bika amakuru mashya, utabanje gusiba history ya kera.
    const previousCurrent = localStorage.getItem(
      "ikiminaSettlementCurrent"
    );
    const previousHistory = localStorage.getItem(
      "ikiminaSettlementHistory"
    );
    const previousSettled = localStorage.getItem("ikiminaSettled");

    try {
      localStorage.setItem(
        "ikiminaSettlementCurrent",
        JSON.stringify(settlement)
      );

      localStorage.setItem(
        "ikiminaSettlementHistory",
        JSON.stringify([...oldHistory, settlement])
      );

      localStorage.setItem("ikiminaSettled", JSON.stringify(true));
    } catch {
      // Gerageza gusubiza amakuru yari asanzwe ahari.
      try {
        if (previousCurrent === null) {
          localStorage.removeItem("ikiminaSettlementCurrent");
        } else {
          localStorage.setItem(
            "ikiminaSettlementCurrent",
            previousCurrent
          );
        }

        if (previousHistory === null) {
          localStorage.removeItem("ikiminaSettlementHistory");
        } else {
          localStorage.setItem(
            "ikiminaSettlementHistory",
            previousHistory
          );
        }

        if (previousSettled === null) {
          localStorage.removeItem("ikiminaSettled");
        } else {
          localStorage.setItem(
            "ikiminaSettled",
            previousSettled
          );
        }
      } catch {
        // Nta kindi gikorwa niba browser yanze gusubiza amakuru.
      }

      alert(
        "Settlement ntiyabitswe. Reba niba browser yawe ifite umwanya uhagije."
      );
      return;
    }

    setIsSettled(true);

    alert(
      "IKIMINA cyaseswe neza! Amakuru yabitswe muri Settlement History."
    );

    navigate("/settlement-history");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Gusesa IKIMINA 🔒</h1>
          <p>
            Reba amafaranga y'ikimina, inyungu z'inguzanyo,
            n'uko abanyamuryango bazigabana.
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

      {!ikimina ? (
        <section className="dashboard-section">
          <h2>Nta IKIMINA kiboneka</h2>
          <p>
            Banza ukore ikimina cyangwa urebe niba amakuru yacyo
            abitswe.
          </p>

          <button
            type="button"
            className="dashboard-action-btn"
            onClick={() => navigate("/create-ikimina")}
          >
            Create IKIMINA
          </button>
        </section>
      ) : (
        <>
          <section
            className="dashboard-section"
            style={{ marginTop: 30 }}
          >
            <h2>Ikimina Information</h2>

            <div
              className="dashboard-grid"
              style={{ marginTop: 20 }}
            >
              <div>
                <p>
                  <strong>Ikimina Name:</strong>{" "}
                  {ikimina.name || "IKIMINA"}
                </p>

                <p style={{ marginTop: 10 }}>
                  <strong>Contribution:</strong>{" "}
                  {formatMoney(ikimina.amount)}
                </p>

                <p style={{ marginTop: 10 }}>
                  <strong>Frequency:</strong>{" "}
                  {ikimina.frequency || "-"}
                </p>
              </div>

              <div>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {ikimina.startDate || "-"}
                </p>

                <p style={{ marginTop: 10 }}>
                  <strong>Duration:</strong>{" "}
                  {ikimina.duration
                    ? `${ikimina.duration} month(s)`
                    : "Not specified"}
                </p>

                <p style={{ marginTop: 10 }}>
                  <strong>Members:</strong> {members.length}
                </p>
              </div>
            </div>
          </section>

          <section
            className="dashboard-section"
            style={{ marginTop: 30, textAlign: "center" }}
          >
            <h2>Settlement Status</h2>

            {isSettled ? (
              <>
                <p
                  style={{
                    color: "#16a34a",
                    fontSize: 24,
                    fontWeight: "bold",
                    marginTop: 20,
                  }}
                >
                  🟢 Settled
                </p>
                <p>Iki IKIMINA cyamaze guseswa.</p>
              </>
            ) : settlementDue ? (
              <>
                <p
                  style={{
                    color: "#16a34a",
                    fontSize: 24,
                    fontWeight: "bold",
                    marginTop: 20,
                  }}
                >
                  🟢 Ready for Settlement
                </p>
                <p>Igihe cyo gusesa IKIMINA cyageze.</p>
              </>
            ) : (
              <>
                <p
                  style={{
                    color: "#d97706",
                    fontSize: 24,
                    fontWeight: "bold",
                    marginTop: 20,
                  }}
                >
                  🟡 Not Yet Due
                </p>
                <p>
                  Igihe ntikiragera cyangwa itariki/duration
                  ntibyuzuye.
                </p>
              </>
            )}
          </section>

          <div
            className="dashboard-cards"
            style={{ marginTop: 30 }}
          >
            <div className="dashboard-card">
              <h3>Total Contributions</h3>
              <p>{formatMoney(totalContributions)}</p>
              <span>Amafaranga yose yatanzwe</span>
            </div>

            <div className="dashboard-card">
              <h3>Loan Interest</h3>
              <p>{formatMoney(totalInterest)}</p>
              <span>Inyungu z'inguzanyo zishyuwe</span>
            </div>

            <div className="dashboard-card">
              <h3>Total Fund</h3>
              <p>{formatMoney(totalFund)}</p>
              <span>Contributions + Interest</span>
            </div>

            <div className="dashboard-card">
              <h3>Pending Loan Repayment</h3>
              <p>{formatMoney(pendingLoanAmount)}</p>
              <span>Umwenda utarishyurwa, harimo inyungu</span>
            </div>
          </div>

          <section
            className="dashboard-section"
            style={{ marginTop: 30 }}
          >
            <h2>Profit Sharing 💰</h2>

            <p style={{ marginTop: 10, marginBottom: 20 }}>
              Inyungu z'inguzanyo zishyuwe zigabanywa
              abanyamuryango ku buryo bungana. Umusanzu wa buri
              muntu ugaragazwa ukwawo.
            </p>

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
                  {members.map((member, index) => {
                    const contribution =
                      getMemberContribution(member);

                    const interestShare =
                      members.length > 0
                        ? Math.floor(
                            totalInterest / members.length
                          ) +
                          (index <
                          totalInterest % members.length
                            ? 1
                            : 0)
                        : 0;

                    return (
                      <tr key={member.id ?? index}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>{getMemberName(member)}</strong>
                        </td>

                        <td>{member.id ?? "N/A"}</td>

                        <td>{formatMoney(contribution)}</td>

                        <td>{formatMoney(interestShare)}</td>

                        <td>
                          <strong>
                            {formatMoney(
                              contribution + interestShare
                            )}
                          </strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {pendingLoans.length > 0 && (
            <section
              className="dashboard-section"
              style={{
                marginTop: 30,
                textAlign: "center",
                border: "1px solid #f59e0b",
              }}
            >
              <h2>⚠️ Pending Loans</h2>

              <p style={{ marginTop: 10 }}>
                Hari inguzanyo zitarishyurwa. Zigomba kwishyurwa
                mbere yo gusesa IKIMINA.
              </p>

              <button
                type="button"
                className="dashboard-action-btn"
                style={{ marginTop: 20 }}
                onClick={() => navigate("/loans")}
              >
                Manage Loans
              </button>
            </section>
          )}

          <section
            className="dashboard-section"
            style={{ marginTop: 30, textAlign: "center" }}
          >
            <h2>Complete Settlement</h2>

            <p style={{ marginTop: 10, marginBottom: 20 }}>
              Iyo igihe cyageze kandi inguzanyo zose zishyuwe,
              ushobora kubika Settlement History.
            </p>

            <button
              type="button"
              className="dashboard-action-btn"
              onClick={handleSettlement}
              disabled={
                isSettled ||
                !settlementDue ||
                pendingLoans.length > 0 ||
                members.length === 0
              }
              style={{
                opacity:
                  isSettled ||
                  !settlementDue ||
                  pendingLoans.length > 0 ||
                  members.length === 0
                    ? 0.5
                    : 1,
                cursor:
                  isSettled ||
                  !settlementDue ||
                  pendingLoans.length > 0 ||
                  members.length === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {isSettled
                ? "IKIMINA Cyamaze Guseswa"
                : "Gusesa IKIMINA"}
            </button>
          </section>
        </>
      )}

      <div style={{ marginTop: 30, textAlign: "center" }}>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => navigate("/settlement-history")}
        >
          View Settlement History
        </button>
      </div>
    </div>
  );
}

export default Settlement;