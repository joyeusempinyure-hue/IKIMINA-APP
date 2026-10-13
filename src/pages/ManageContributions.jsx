
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ManageContributions.css";

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function getGroupKeys(group) {
  if (!group) return [];

  return [group.id, group.code, group.name]
    .filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    )
    .map((value) => String(value).trim().toLowerCase());
}

function belongsToGroup(item, group) {
  if (
    item.ikiminaId === undefined ||
    item.ikiminaId === null ||
    item.ikiminaId === ""
  ) {
    return false;
  }

  return getGroupKeys(group).includes(
    String(item.ikiminaId).trim().toLowerCase()
  );
}

function getPrimaryGroupKey(group) {
  return group?.id ?? group?.code ?? group?.name ?? "";
}

function formatMoney(value) {
  return Number(value || 0).toLocaleString("en-US");
}

function getToday() {
  const now = new Date();
  return new Date(
    now.getTime() - now.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);
}

function ManageContributions() {
  const navigate = useNavigate();

  const [ikimina, setIkimina] = useState(null);
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(getToday());

  useEffect(() => {
    const groups = readStorage("ikiminaGroups", []);
    const activeId = localStorage.getItem("activeIkiminaId");
    const savedIkimina = readStorage("ikiminaData", null);

    const selectedGroup =
      groups.find((group) =>
        getGroupKeys(group).includes(
          String(activeId || "").trim().toLowerCase()
        )
      ) ||
      savedIkimina ||
      null;

    if (!selectedGroup) {
      setIkimina(null);
      setMembers([]);
      setContributions([]);
      setMemberId("");
      return;
    }

    setIkimina(selectedGroup);

    const groupKey = getPrimaryGroupKey(selectedGroup);
    const allMembers = readStorage("ikiminaMembers", []);

    const normalizedMembers = allMembers.map((member, index) => {
      const normalizedMember = {
        ...member,
        id: member.id ?? `member-${Date.now()}-${index}`,
        name: member.name || member.fullName || "",
      };

      if (
        normalizedMember.ikiminaId === undefined ||
        normalizedMember.ikiminaId === null ||
        normalizedMember.ikiminaId === ""
      ) {
        normalizedMember.ikiminaId = groupKey;
      }

      return normalizedMember;
    });

    localStorage.setItem(
      "ikiminaMembers",
      JSON.stringify(normalizedMembers)
    );

    const groupMembers = normalizedMembers.filter((member) =>
      belongsToGroup(member, selectedGroup)
    );

    setMembers(groupMembers);
    setMemberId(
      groupMembers.length ? String(groupMembers[0].id) : ""
    );

    const allContributions = readStorage(
      "ikiminaContributions",
      []
    );

    const normalizedContributions = allContributions.map((item) => {
      if (
        item.ikiminaId === undefined ||
        item.ikiminaId === null ||
        item.ikiminaId === ""
      ) {
        return { ...item, ikiminaId: groupKey };
      }

      return item;
    });

    localStorage.setItem(
      "ikiminaContributions",
      JSON.stringify(normalizedContributions)
    );

    setContributions(
      normalizedContributions.filter((item) =>
        belongsToGroup(item, selectedGroup)
      )
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!ikimina) {
      alert("Banza uhitemo ikimina.");
      navigate("/my-ikimina");
      return;
    }

    if (!memberId || !amount || !date) {
      alert("Uzuza amakuru yose.");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      alert("Amafaranga agomba kuba arenze zero.");
      return;
    }

    const selectedMember = members.find(
      (member) => String(member.id) === String(memberId)
    );

    if (!selectedMember) {
      alert("Umunyamuryango ntiyabonetse.");
      return;
    }

    const newContribution = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ikiminaId: getPrimaryGroupKey(ikimina),
      ikiminaName: ikimina.name || "",
      ikiminaCode: ikimina.code || "",
      memberId: selectedMember.id,
      memberName:
        selectedMember.name ||
        selectedMember.fullName ||
        selectedMember.email ||
        "Umunyamuryango",
      amount: Number(amount),
      date,
      status: "Paid",
    };

    const allContributions = readStorage(
      "ikiminaContributions",
      []
    );

    const updatedContributions = [
      ...allContributions,
      newContribution,
    ];

    localStorage.setItem(
      "ikiminaContributions",
      JSON.stringify(updatedContributions)
    );

    setContributions((previous) => [
      ...previous,
      newContribution,
    ]);

    setAmount("");
    setDate(getToday());

    alert("Contribution yabitswe neza!");
  };

  const total = contributions.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  return (
    <main className="manage-contributions-page">
      <header className="manage-contributions-header">
        <div className="mc-heading-text">
          <h1>Manage Contributions</h1>
          <p>
            Andika kandi ukurikirane amafaranga abanyamuryango batanga.
          </p>
        </div>

        <button
          type="button"
          className="mc-secondary-button"
          onClick={() => navigate("/my-ikimina")}
        >
          <span aria-hidden="true">←</span>
          Hitamo Ikimina
        </button>
      </header>

      {!ikimina ? (
        <section className="mc-empty">
          <h2>Nta kimina cyatoranyijwe</h2>
          <p>Banza uhitemo ikimina ushaka gucunga.</p>

          <button
            type="button"
            className="mc-primary-button"
            onClick={() => navigate("/my-ikimina")}
          >
            Jya kuri My Ikimina
          </button>
        </section>
      ) : (
        <>
          <section className="mc-group-info">
            <div className="mc-group-icon" aria-hidden="true">
              🏦
            </div>

            <div className="mc-group-details">
              <span className="mc-section-label">
                Ikimina cyatoranyijwe
              </span>

              <h2>{ikimina.name || "Ikimina kitagira izina"}</h2>

              <p>
                Code:{" "}
                <strong>{ikimina.code || "Nta code"}</strong>
              </p>
            </div>
          </section>

          <section className="mc-summary">
            <article className="mc-summary-card mc-members-card">
              <div className="mc-card-icon" aria-hidden="true">
                👥
              </div>
              <div>
                <span>Abanyamuryango</span>
                <h2>{members.length}</h2>
              </div>
            </article>

            <article className="mc-summary-card mc-count-card">
              <div className="mc-card-icon" aria-hidden="true">
                📋
              </div>
              <div>
                <span>Contributions zose</span>
                <h2>{contributions.length}</h2>
              </div>
            </article>

            <article className="mc-summary-card mc-total-card">
              <div className="mc-card-icon" aria-hidden="true">
                💰
              </div>
              <div>
                <span>Amafaranga yose</span>
                <h2>{formatMoney(total)} RWF</h2>
              </div>
            </article>
          </section>

          <section className="mc-content">
            <form className="mc-form" onSubmit={handleSubmit}>
              <div className="mc-form-heading">
                <div className="mc-form-icon" aria-hidden="true">
                  ➕
                </div>
                <div>
                  <h2>Ongeramo Contribution</h2>
                  <p>Andika amafaranga umunyamuryango yatanze.</p>
                </div>
              </div>

              <div className="mc-form-field">
                <label htmlFor="mc-member">
                  Hitamo umunyamuryango
                </label>

                <select
                  id="mc-member"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                  disabled={members.length === 0}
                >
                  <option value="">
                    -- Hitamo umunyamuryango --
                  </option>

                  {members.map((member) => (
                    <option
                      key={member.id}
                      value={String(member.id)}
                    >
                      {member.name ||
                        member.fullName ||
                        member.email ||
                        "Umunyamuryango"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mc-form-field">
                <label htmlFor="mc-amount">
                  Amafaranga (RWF)
                </label>

                <input
                  id="mc-amount"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Urugero: 10000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="mc-form-field">
                <label htmlFor="mc-date">Itariki</label>

                <input
                  id="mc-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="mc-primary-button"
                disabled={members.length === 0}
              >
                <span aria-hidden="true">＋</span>
                Bika Contribution
              </button>

              {members.length === 0 && (
                <p className="mc-notice">
                  Nta munyamuryango uraboneka muri iki kimina.
                  Reba abanyamuryango muri Invite Members.
                </p>
              )}
            </form>

            <section className="mc-history">
              <div className="mc-history-heading">
                <div>
                  <h2>Contribution History</h2>
                  <p>Reba amafaranga abanyamuryango batanze.</p>
                </div>

                <span className="mc-history-count">
                  {contributions.length}
                </span>
              </div>

              {contributions.length === 0 ? (
                <div className="mc-empty-history">
                  <div className="mc-empty-history-icon">
                    📋
                  </div>
                  <h3>Nta contribution irabikwa</h3>
                  <p>
                    Amafaranga uzabika azagaragara hano.
                  </p>
                </div>
              ) : (
                <div className="mc-table-wrapper">
                  <table className="mc-table">
                    <thead>
                      <tr>
                        <th>Umunyamuryango</th>
                        <th>Amafaranga</th>
                        <th>Itariki</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {contributions
                        .slice()
                        .reverse()
                        .map((item, index) => {
                          const member = members.find(
                            (person) =>
                              String(person.id) ===
                              String(item.memberId)
                          );

                          return (
                            <tr key={item.id || index}>
                              <td className="mc-member-cell">
                                {item.memberName ||
                                  member?.name ||
                                  member?.fullName ||
                                  member?.email ||
                                  "Umunyamuryango"}
                              </td>

                              <td className="mc-money-cell">
                                {formatMoney(item.amount)} RWF
                              </td>

                              <td>{item.date || "-"}</td>

                              <td>
                                <span className="mc-paid">
                                  {item.status || "Paid"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </section>
        </>
      )}
    </main>
  );
}

export default ManageContributions;