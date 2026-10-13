
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/primaryButton";
import Card from "../components/card";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function Dashboard() {
  const navigate = useNavigate();

  const [contributions, setContributions] = useState([]);
  const [ikimina, setIkimina] = useState(null);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [isSettled, setIsSettled] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const user = readStorage("ikiminaUser", null);

    if (!user) {
      navigate("/login");
      return;
    }

    const groups = readStorage("ikiminaGroups", []);
    const savedIkimina = readStorage("ikiminaData", null);
    const activeId = localStorage.getItem("activeIkiminaId");

    // Find the selected Ikimina.
    let selectedIkimina = groups.find(
      (group) => String(group.id) === String(activeId)
    );

    // Support the older single-Ikimina setup.
    if (
      !selectedIkimina &&
      savedIkimina &&
      (!activeId ||
        String(savedIkimina.id) === String(activeId))
    ) {
      selectedIkimina = savedIkimina;
    }

    if (!selectedIkimina) {
      setIkimina(null);
      setContributions([]);
      setMembers([]);
      setLoans([]);
      setIsSettled(false);
      return;
    }

    // Keep the currently selected group synchronized.
    localStorage.setItem(
      "activeIkiminaId",
      String(selectedIkimina.id)
    );

    localStorage.setItem(
      "ikiminaData",
      JSON.stringify(selectedIkimina)
    );

    setIkimina(selectedIkimina);

    const groupId = String(selectedIkimina.id);

    const allContributions = readStorage(
      "ikiminaContributions",
      []
    );

    const allMembers = readStorage(
      "ikiminaMembers",
      []
    );

    const allLoans = readStorage(
      "ikiminaLoans",
      []
    );

    // Old records without ikiminaId can safely be assigned
    // automatically only when there is exactly one known group.
    const legacyCanBeAssigned = groups.length <= 1;

    const migrateLegacyRecords = (records, storageKey) => {
      let changed = false;

      const migrated = records.map((record) => {
        if (
          !record.ikiminaId &&
          legacyCanBeAssigned
        ) {
          changed = true;

          return {
            ...record,
            ikiminaId: groupId,
          };
        }

        return record;
      });

      if (changed) {
        localStorage.setItem(
          storageKey,
          JSON.stringify(migrated)
        );
      }

      return migrated;
    };

    const taggedContributions = migrateLegacyRecords(
      allContributions,
      "ikiminaContributions"
    );

    const taggedMembers = migrateLegacyRecords(
      allMembers,
      "ikiminaMembers"
    );

    const taggedLoans = migrateLegacyRecords(
      allLoans,
      "ikiminaLoans"
    );

    // Show only records belonging to the selected group.
    setContributions(
      taggedContributions.filter(
        (item) => String(item.ikiminaId) === groupId
      )
    );

    setMembers(
      taggedMembers.filter(
        (item) => String(item.ikiminaId) === groupId
      )
    );

    setLoans(
      taggedLoans.filter(
        (item) => String(item.ikiminaId) === groupId
      )
    );

    const groupSettlement = readStorage(
      `ikiminaSettled_${groupId}`,
      null
    );

    // Use the old settlement value only when there is
    // one group, to avoid sharing settlement status.
    const oldSettlement = readStorage(
      "ikiminaSettled",
      false
    );

    setIsSettled(
      groupSettlement !== null
        ? groupSettlement
        : legacyCanBeAssigned
          ? oldSettlement
          : false
    );
  };

  const totalContribution = contributions.reduce(
    (total, contribution) =>
      total + Number(contribution.amount || 0),
    0
  );

  const pendingLoans = loans.filter(
    (loan) => loan.status !== "Paid"
  );

  const paidLoans = loans.filter(
    (loan) => loan.status === "Paid"
  );

  const totalLoanAmount = loans.reduce(
    (total, loan) =>
      total + Number(loan.amount || 0),
    0
  );

  const totalLoanInterest = paidLoans.reduce(
    (total, loan) =>
      total + Number(
        loan.interest ??
        loan.interestAmount ??
        0
      ),
    0
  );

  const getNextContributionDate = () => {
    if (!ikimina?.startDate) {
      return "No schedule";
    }

    const nextDate = new Date(
      `${ikimina.startDate}T00:00:00`
    );

    if (Number.isNaN(nextDate.getTime())) {
      return "No schedule";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (nextDate <= today) {
      if (ikimina.frequency === "Weekly") {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (ikimina.frequency === "Quarterly") {
        nextDate.setMonth(nextDate.getMonth() + 3);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    }

    return nextDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("ikiminaUser");
    navigate("/login");
  };

  const buttonData = [
    {
      name: "My Ikimina",
      icon: "🗂️",
      link: "/my-ikimina",
    },
    {
      name: "Create Ikimina",
      icon: "➕",
      link: "/create-ikimina",
    },
    {
      name: "Join Ikimina",
      icon: "🔗",
      link: "/join-ikimina",
    },
    {
      name: "Invite Members",
      icon: "👥",
      link: "/invite-members",
    },
    {
      name: "Manage Contribution",
      icon: "💰",
      link: "/manage-contributions",
    },
    {
      name: "Manage Loans",
      icon: "🏦",
      link: "/loans",
    },
    {
      name: "Loans History",
      icon: "📋",
      link: "/loans-history",
    },
    {
      name: "Ikimina Fund",
      icon: "💵",
      link: "/fund",
    },
    {
      name: "Financial Overview",
      icon: "📊",
      link: "/rotation",
    },
    {
      name: "Gusesa Ikimina",
      icon: "🤝",
      link: "/settlement",
    },
    {
      name: "Settlement History",
      icon: "📋",
      link: "/settlement-history",
    },
    {
      name: "Members",
      icon: "👥",
      link: "/members",
    },
  ];

  const statuses = [
    {
      title: "Total Contribution",
      number: `${totalContribution.toLocaleString()} RWF`,
      desc: "Amafaranga amaze gutangwa",
    },
    {
      title: "Members",
      number: String(members.length),
      desc: "Abanyamuryango b'iki kimina",
    },
    {
      title: "Next Contribution",
      number: getNextContributionDate(),
      desc: "Itariki yo gutura",
    },
    {
      title: "Loans",
      number: String(loans.length),
      desc: "Inguzanyo z'iki kimina",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Murakaza neza 👋</h1>
          <p>
            Reba uko IKIMINA cyawe gihagaze.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          style={{
            border: "none",
            borderRadius: "8px",
            background: "#dc2626",
            color: "#fff",
            padding: "12px 18px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          🚪 Logout
        </button>
      </div>

      <div
        className="dashboard-section"
        style={{ marginBottom: "30px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
          }}
        >
          <h2>Ikimina Information</h2>

          <PrimaryButton
            name="My Ikimina"
            icon="🗂️"
            link="/my-ikimina"
          />
        </div>

        {ikimina ? (
          <div className="dashboard-grid">
            <div>
              <p>
                <strong>Ikimina Name:</strong>{" "}
                {ikimina.name}
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Contribution:</strong>{" "}
                {Number(ikimina.amount || 0).toLocaleString()} RWF
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Frequency:</strong>{" "}
                {ikimina.frequency}
              </p>
            </div>

            <div>
              <p>
                <strong>Ikimina Code:</strong>{" "}
                {ikimina.code}
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Start Date:</strong>{" "}
                {ikimina.startDate}
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Planned Members:</strong>{" "}
                {ikimina.members}
              </p>

              {ikimina.duration && (
                <p style={{ marginTop: "10px" }}>
                  <strong>Duration:</strong>{" "}
                  {ikimina.duration} month(s)
                </p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <p>
              Nta kimina wahisemo. Kora ikimina gishya
              cyangwa uhitemo icyo usanzwe urimo.
            </p>

            <PrimaryButton
              name="Create Ikimina"
              icon="➕"
              link="/create-ikimina"
            />

            <div style={{ marginTop: "12px" }}>
              <PrimaryButton
                name="Join Ikimina"
                icon="🔗"
                link="/join-ikimina"
              />
            </div>
          </div>
        )}
      </div>

      {ikimina && (
        <>
          <div
            className="dashboard-section"
            style={{
              marginBottom: "30px",
              textAlign: "center",
            }}
          >
            <h2>Ikimina Status</h2>

            {isSettled ? (
              <>
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: "22px",
                    fontWeight: "bold",
                  }}
                >
                  🔴 Settled
                </p>

                <p>
                  Iki kimina cyamaze guseswa.
                </p>

                <PrimaryButton
                  name="Start New Cycle"
                  icon="🔄"
                  link="/create-ikimina"
                />
              </>
            ) : (
              <>
                <p
                  style={{
                    color: "#16a34a",
                    fontSize: "22px",
                    fontWeight: "bold",
                  }}
                >
                  🟢 Active
                </p>

                <p>
                  Iki kimina kiracyakora.
                </p>
              </>
            )}
          </div>

          <div className="dashboard-cards">
            {statuses.map((status) => (
              <Card
                key={status.title}
                title={status.title}
                number={status.number}
                desc={status.desc}
              />
            ))}
          </div>

          <div
            className="dashboard-section"
            style={{ marginTop: "30px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2>Loans Summary</h2>
                <p>
                  Inguzanyo z'iki kimina.
                </p>
              </div>

              <PrimaryButton
                name="Manage Loans"
                icon="🏦"
                link="/loans"
              />
            </div>

            <div className="dashboard-cards">
              <Card
                title="Total Loans"
                number={`${totalLoanAmount.toLocaleString()} RWF`}
                desc="Amafaranga yatijwe"
              />

              <Card
                title="Pending"
                number={String(pendingLoans.length)}
                desc="Zitarishyurwa"
              />

              <Card
                title="Paid"
                number={String(paidLoans.length)}
                desc="Zamaze kwishyurwa"
              />

              <Card
                title="Interest"
                number={`${totalLoanInterest.toLocaleString()} RWF`}
                desc="Inyungu zishyuwe"
              />
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-section">
              <h2>Contribution History</h2>

              {contributions.length === 0 ? (
                <p>
                  Nta contribution iraboneka muri iki kimina.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {[...contributions]
                        .reverse()
                        .map((contribution, index) => (
                          <tr
                            key={
                              contribution.id ??
                              `${contribution.date}-${index}`
                            }
                          >
                            <td>
                              {contribution.memberName || "-"}
                            </td>

                            <td>
                              {contribution.date || "-"}
                            </td>

                            <td>
                              {Number(
                                contribution.amount || 0
                              ).toLocaleString()} RWF
                            </td>

                            <td>
                              {contribution.status || "-"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="dashboard-section">
              <h2>Recent Transactions</h2>

              {contributions.length === 0 ? (
                <div className="empty-state">
                  <p>
                    Nta transactions ziraboneka muri iki kimina.
                  </p>
                </div>
              ) : (
                <>
                  <p>
                    <strong>{contributions.length}</strong>{" "}
                    contribution(s) recorded.
                  </p>

                  <p style={{ marginTop: "15px" }}>
                    Total:{" "}
                    <strong>
                      {totalContribution.toLocaleString()} RWF
                    </strong>
                  </p>

                  <div style={{ marginTop: "20px" }}>
                    <PrimaryButton
                      name="Manage Contributions"
                      icon="💰"
                      link="/manage-contributions"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      <div
        className="dashboard-section actions-section"
        style={{ marginTop: "30px" }}
      >
        <h2>Ikimina Management</h2>

        <div className="dashboard-actions">
          {buttonData.map((data) => (
            <PrimaryButton
              key={data.link}
              name={data.name}
              icon={data.icon}
              link={data.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;