
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Loans() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("10");
  const [date, setDate] = useState("");

  const readStorage = (key) => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const readObject = (key) => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || "null");

      return data &&
        !Array.isArray(data) &&
        typeof data === "object"
        ? data
        : null;
    } catch {
      return null;
    }
  };

  const getGroupKeys = (group) => {
    if (!group) return [];

    return [group.id, group.code, group.name]
      .filter(
        (value) =>
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
      )
      .map(String);
  };

  const getActiveGroup = () => {
    const groups = readStorage("ikiminaGroups");
    const activeId = localStorage.getItem("activeIkiminaId");

    if (activeId) {
      const selected = groups.find((group) =>
        getGroupKeys(group).includes(String(activeId))
      );

      if (selected) return selected;

      const savedIkimina = readObject("ikiminaData");

      if (
        savedIkimina &&
        getGroupKeys(savedIkimina).includes(String(activeId))
      ) {
        return savedIkimina;
      }
    }

    if (groups.length === 1) return groups[0];

    if (groups.length === 0) {
      return readObject("ikiminaData");
    }

    return null;
  };

  const belongsToActiveGroup = (record, group, groups) => {
    if (!record) return false;

    const recordGroupId = record.ikiminaId;

    // Amakuru ya kera ataragiraga ikimina yanditseho.
    if (
      recordGroupId === undefined ||
      recordGroupId === null ||
      recordGroupId === ""
    ) {
      return groups.length <= 1;
    }

    if (!group) return false;

    return getGroupKeys(group).includes(String(recordGroupId));
  };

  const getMemberName = (member) =>
    member?.name || member?.fullName || "Unknown Member";

  const formatMoney = (value) =>
    `${Number(value || 0).toLocaleString("en-US")} RWF`;

  const getInterest = (loan) => {
    if (loan.interest !== undefined && loan.interest !== null) {
      return Number(loan.interest) || 0;
    }

    if (
      loan.interestAmount !== undefined &&
      loan.interestAmount !== null
    ) {
      return Number(loan.interestAmount) || 0;
    }

    return Math.round(
      (Number(loan.amount || 0) *
        Number(loan.interestRate || 0)) /
        100
    );
  };

  const getTotalToPay = (loan) => {
    if (loan.totalToPay !== undefined && loan.totalToPay !== null) {
      return Number(loan.totalToPay) || 0;
    }

    return Number(loan.amount || 0) + getInterest(loan);
  };

  const loadData = () => {
    const groups = readStorage("ikiminaGroups");
    const activeGroup = getActiveGroup();

    const savedMembers = readStorage("ikiminaMembers");
    const allLoans = readStorage("ikiminaLoans");

    const visibleMembers = savedMembers.filter((member) =>
      belongsToActiveGroup(member, activeGroup, groups)
    );

    const visibleLoans = allLoans.filter((loan) =>
      belongsToActiveGroup(loan, activeGroup, groups)
    );

    setMembers(visibleMembers);
    setLoans(visibleLoans);
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveAllLoans = (updatedLoans) => {
    localStorage.setItem(
      "ikiminaLoans",
      JSON.stringify(updatedLoans)
    );
    loadData();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!memberId || !amount || interestRate === "" || !date) {
      alert("Uzuza imyanya yose mbere yo gukomeza.");
      return;
    }

    const loanAmount = Number(amount);
    const rate = Number(interestRate);

    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      alert("Amafaranga y'inguzanyo agomba kurenga zeru.");
      return;
    }

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      alert("Inyungu igomba kuba hagati ya 0% na 100%.");
      return;
    }

    const selectedMember = members.find(
      (member) => String(member.id) === String(memberId)
    );

    if (!selectedMember) {
      alert("Umunyamuryango ntiyabonetse.");
      return;
    }

    const groups = readStorage("ikiminaGroups");
    const activeGroup = getActiveGroup();

    if (groups.length > 1 && !activeGroup) {
      alert("Banza uhitemo ikimina urimo gukoreramo.");
      return;
    }

    const interest = Math.round((loanAmount * rate) / 100);
    const totalToPay = loanAmount + interest;

    const groupId =
      activeGroup?.id ??
      activeGroup?.code ??
      activeGroup?.name ??
      selectedMember.ikiminaId ??
      null;

    const newLoan = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      ikiminaId: groupId,
      ikiminaName: activeGroup?.name || "",
      memberId: selectedMember.id,
      memberName: getMemberName(selectedMember),
      amount: loanAmount,
      interestRate: rate,
      interest,
      totalToPay,
      date,
      status: "Pending",
      paidDate: null,
      createdAt: new Date().toISOString(),
    };

    const allLoans = readStorage("ikiminaLoans");

    saveAllLoans([...allLoans, newLoan]);

    alert(
      `Inguzanyo yongewemo neza.\n\n` +
        `Umunyamuryango: ${getMemberName(selectedMember)}\n` +
        `Inguzanyo: ${formatMoney(loanAmount)}\n` +
        `Inyungu: ${formatMoney(interest)}\n` +
        `Amafaranga yose agomba kwishyurwa: ${formatMoney(
          totalToPay
        )}`
    );

    setMemberId("");
    setAmount("");
    setInterestRate("10");
    setDate("");
  };

  const markAsPaid = (loanId) => {
    const confirmed = window.confirm(
      "Wemeza ko amafaranga yose y'iyi nguzanyo yakiriwe?"
    );

    if (!confirmed) return;

    const groups = readStorage("ikiminaGroups");
    const activeGroup = getActiveGroup();
    const allLoans = readStorage("ikiminaLoans");

    const targetLoan = allLoans.find(
      (loan) =>
        String(loan.id) === String(loanId) &&
        belongsToActiveGroup(loan, activeGroup, groups)
    );

    if (!targetLoan) {
      alert("Iyi nguzanyo ntiyabonetse muri iki kimina.");
      return;
    }

    if (targetLoan.status === "Paid") {
      alert("Iyi nguzanyo yamaze kwishyurwa.");
      return;
    }

    const updatedLoans = allLoans.map((loan) =>
      String(loan.id) === String(loanId) &&
      belongsToActiveGroup(loan, activeGroup, groups)
        ? {
            ...loan,
            status: "Paid",
            paidDate: new Date().toISOString().split("T")[0],
          }
        : loan
    );

    saveAllLoans(updatedLoans);
    alert("Inguzanyo yashyizwe muri Paid.");
  };

  const deleteLoan = (loanId) => {
    const confirmed = window.confirm(
      "Urashaka gusiba iyi nguzanyo burundu? Iki gikorwa ntigisubizwa inyuma."
    );

    if (!confirmed) return;

    const groups = readStorage("ikiminaGroups");
    const activeGroup = getActiveGroup();
    const allLoans = readStorage("ikiminaLoans");

    const targetLoan = allLoans.find(
      (loan) =>
        String(loan.id) === String(loanId) &&
        belongsToActiveGroup(loan, activeGroup, groups)
    );

    if (!targetLoan) {
      alert("Iyi nguzanyo ntiyabonetse muri iki kimina.");
      return;
    }

    const updatedLoans = allLoans.filter(
      (loan) =>
        !(
          String(loan.id) === String(loanId) &&
          belongsToActiveGroup(loan, activeGroup, groups)
        )
    );

    saveAllLoans(updatedLoans);
    alert("Inguzanyo yasibwe.");
  };

  const totalLoans = loans.reduce(
    (total, loan) => total + Number(loan.amount || 0),
    0
  );

  const totalInterest = loans.reduce(
    (total, loan) => total + getInterest(loan),
    0
  );

  const totalToPay = loans.reduce(
    (total, loan) => total + getTotalToPay(loan),
    0
  );

  const pendingLoans = loans.filter(
    (loan) => loan.status !== "Paid"
  ).length;

  const paidLoans = loans.filter(
    (loan) => loan.status === "Paid"
  ).length;

  const paidTotal = loans
    .filter((loan) => loan.status === "Paid")
    .reduce(
      (total, loan) => total + getTotalToPay(loan),
      0
    );

  return (
    <div className="loans-page">
      <div className="loans-header">
        <div>
          <h1>Manage Loans 💳</h1>
          <p>
            Genzura inguzanyo z'abanyamuryango n'inyungu bazishyura.
          </p>
        </div>

        <button
          type="button"
          className="loans-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

      <div className="loans-summary">
        <div className="loans-summary-card">
          <span className="loans-summary-icon">💰</span>
          <h3>Total Loans</h3>
          <strong>{formatMoney(totalLoans)}</strong>
          <p>Amafaranga yose yatijwe</p>
        </div>

        <div className="loans-summary-card">
          <span className="loans-summary-icon">📈</span>
          <h3>Total Interest</h3>
          <strong>{formatMoney(totalInterest)}</strong>
          <p>Inyungu zose z'inguzanyo</p>
        </div>

        <div className="loans-summary-card">
          <span className="loans-summary-icon">🧾</span>
          <h3>Total To Pay</h3>
          <strong>{formatMoney(totalToPay)}</strong>
          <p>Inguzanyo n'inyungu byose</p>
        </div>

        <div className="loans-summary-card">
          <span className="loans-summary-icon">⏳</span>
          <h3>Pending Loans</h3>
          <strong>{pendingLoans}</strong>
          <p>Inguzanyo zitarishyurwa</p>
        </div>

        <div className="loans-summary-card">
          <span className="loans-summary-icon">✅</span>
          <h3>Paid Loans</h3>
          <strong>{paidLoans}</strong>
          <p>Inguzanyo zishyuwe</p>
        </div>

        <div className="loans-summary-card">
          <span className="loans-summary-icon">💵</span>
          <h3>Amount Repaid</h3>
          <strong>{formatMoney(paidTotal)}</strong>
          <p>Inguzanyo zemejwe ko zishyuwe</p>
        </div>
      </div>

      <section className="loans-panel">
        <div className="loans-panel-heading">
          <h2>Add New Loan</h2>
          <p>Andika amakuru y'inguzanyo nshya.</p>
        </div>

        {members.length === 0 ? (
          <div className="loans-empty">
            <h3>Nta munyamuryango uraboneka.</h3>
            <p>
              Banza wongere abanyamuryango mu kimina ukoresha.
            </p>

            <button
              type="button"
              className="loans-primary-button"
              onClick={() => navigate("/invite-members")}
            >
              ➕ Add Member
            </button>
          </div>
        ) : (
          <form className="loans-form" onSubmit={handleSubmit}>
            <div className="loans-form-field">
              <label htmlFor="loan-member">Member</label>

              <select
                id="loan-member"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                required
              >
                <option value="">Select Member</option>

                {members.map((member, index) => (
                  <option
                    key={member.id ?? index}
                    value={member.id}
                  >
                    {getMemberName(member)}
                  </option>
                ))}
              </select>
            </div>

            <div className="loans-form-field">
              <label htmlFor="loan-amount">
                Loan Amount (RWF)
              </label>

              <input
                id="loan-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100000"
                required
              />
            </div>

            <div className="loans-form-field">
              <label htmlFor="loan-interest">Interest (%)</label>

              <input
                id="loan-interest"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
              />
            </div>

            <div className="loans-form-field">
              <label htmlFor="loan-date">Loan Date</label>

              <input
                id="loan-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {Number(amount) > 0 &&
              interestRate !== "" &&
              Number(interestRate) >= 0 && (
                <div className="loans-calculation">
                  <span>
                    Interest:{" "}
                    <strong>
                      {formatMoney(
                        Math.round(
                          (Number(amount) *
                            Number(interestRate)) /
                            100
                        )
                      )}
                    </strong>
                  </span>

                  <span>
                    Total to pay:{" "}
                    <strong>
                      {formatMoney(
                        Number(amount) +
                          Math.round(
                            (Number(amount) *
                              Number(interestRate)) /
                              100
                          )
                      )}
                    </strong>
                  </span>
                </div>
              )}

            <div className="loans-form-footer">
              <button
                type="submit"
                className="loans-primary-button"
              >
                ➕ Add Loan
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="loans-panel">
        <div className="loans-table-heading">
          <div>
            <h2>Current Loans</h2>
            <p>Inguzanyo ziri muri IKIMINA.</p>

            <span className="loans-record-count">
              {loans.length} loans · {paidLoans} paid
            </span>
          </div>

          <button
            type="button"
            className="loans-history-button"
            onClick={() => navigate("/loans-history")}
          >
            📋 Loans History
          </button>
        </div>

        {loans.length === 0 ? (
          <div className="loans-empty">
            <span>💳</span>
            <h3>Nta loans ziraboneka.</h3>
            <p>Ongeramo loan nshya kugira ngo igaragare hano.</p>
          </div>
        ) : (
          <div className="loans-table-wrapper">
            <table className="loans-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Interest</th>
                  <th>Total To Pay</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loans.map((loan, index) => (
                  <tr key={loan.id ?? index}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>
                        {loan.memberName || "Unknown Member"}
                      </strong>

                      <span className="loans-member-id">
                        Member ID: {loan.memberId ?? "N/A"}
                      </span>
                    </td>

                    <td>{formatMoney(loan.amount)}</td>

                    <td>
                      {formatMoney(getInterest(loan))}
                      <small className="loans-member-id">
                        ({Number(loan.interestRate || 0)}%)
                      </small>
                    </td>

                    <td>
                      <strong>
                        {formatMoney(getTotalToPay(loan))}
                      </strong>
                    </td>

                    <td>{loan.date || "-"}</td>

                    <td>
                      <span
                        className={
                          loan.status === "Paid"
                            ? "loan-status loan-status-paid"
                            : "loan-status loan-status-pending"
                        }
                      >
                        {loan.status || "Pending"}
                      </span>

                      {loan.paidDate && (
                        <small className="loans-member-id">
                          Paid: {loan.paidDate}
                        </small>
                      )}
                    </td>

                    <td>
                      <div className="loans-row-actions">
                        {loan.status !== "Paid" && (
                          <button
                            type="button"
                            className="loan-paid-button"
                            onClick={() => markAsPaid(loan.id)}
                          >
                            Mark Paid
                          </button>
                        )}

                        <button
                          type="button"
                          className="loan-delete-button"
                          onClick={() => deleteLoan(loan.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Loans;

