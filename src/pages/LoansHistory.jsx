
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LoansHistory() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);

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
        typeof data === "object" &&
        !Array.isArray(data)
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

  const loadLoans = () => {
    const groups = readStorage("ikiminaGroups");
    const activeGroup = getActiveGroup();
    const allLoans = readStorage("ikiminaLoans");

    const visibleLoans = allLoans.filter((loan) =>
      belongsToActiveGroup(loan, activeGroup, groups)
    );

    setLoans(visibleLoans);
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const formatMoney = (amount) =>
    `${Number(amount || 0).toLocaleString("en-US")} RWF`;

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

  const totalLoans = loans.reduce(
    (total, loan) => total + Number(loan.amount || 0),
    0
  );

  const totalInterest = loans.reduce(
    (total, loan) => total + getInterest(loan),
    0
  );

  const totalRepayment = loans.reduce(
    (total, loan) => total + getTotalToPay(loan),
    0
  );

  const paidLoans = loans.filter(
    (loan) => loan.status === "Paid"
  );

  const pendingLoans = loans.filter(
    (loan) => loan.status !== "Paid"
  );

  const paidAmount = paidLoans.reduce(
    (total, loan) => total + getTotalToPay(loan),
    0
  );

  const pendingAmount = pendingLoans.reduce(
    (total, loan) => total + getTotalToPay(loan),
    0
  );

  const sortedLoans = [...loans].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();

    if (dateA !== dateB) {
      return dateB - dateA;
    }

    const createdA = new Date(a.createdAt || 0).getTime();
    const createdB = new Date(b.createdAt || 0).getTime();

    if (createdA !== createdB) {
      return createdB - createdA;
    }

    return String(b.id || "").localeCompare(String(a.id || ""));
  });

  return (
    <div className="loans-page">
      <div className="loans-header">
        <div>
          <h1>Loans History 📋</h1>
          <p>
            Amateka y'inguzanyo n'uko zishyuwe.
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
          <p>Inyungu zose</p>
        </div>

        <div className="loans-summary-card">
          <span className="loans-summary-icon">✅</span>
          <h3>Paid Loans</h3>
          <strong>{paidLoans.length}</strong>
          <p>Inguzanyo zishyuwe</p>
        </div>

        <div className="loans-summary-card">
          <span className="loans-summary-icon">⏳</span>
          <h3>Pending Loans</h3>
          <strong>{pendingLoans.length}</strong>
          <p>Inguzanyo zitarishyurwa</p>
        </div>
      </div>

      <section className="loans-panel">
        <div className="loans-table-heading">
          <div>
            <h2>All Loan Records</h2>
            <p>
              Amateka y'inguzanyo zatanzwe muri iki kimina.
            </p>

            <span className="loans-record-count">
              {loans.length} loan records
            </span>
          </div>

          <button
            type="button"
            className="loans-history-button"
            onClick={() => navigate("/loans")}
          >
            💳 Manage Loans
          </button>
        </div>

        {sortedLoans.length === 0 ? (
          <div className="loans-empty">
            <span>📋</span>
            <h3>Nta loan history iraboneka.</h3>
            <p>
              Inguzanyo zizagaragara hano nyuma yo gutangwa.
            </p>

            <button
              type="button"
              className="loans-primary-button"
              onClick={() => navigate("/loans")}
            >
              ➕ Add New Loan
            </button>
          </div>
        ) : (
          <div className="loans-table-wrapper">
            <table className="loans-table loans-history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Loan Amount</th>
                  <th>Interest</th>
                  <th>Total To Pay</th>
                  <th>Loan Date</th>
                  <th>Paid Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {sortedLoans.map((loan, index) => (
                  <tr key={loan.id ?? index}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>
                        {loan.memberName || "Unknown Member"}
                      </strong>

                      <span className="loans-member-id">
                        ID: {loan.memberId ?? "N/A"}
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

                    <td>{loan.paidDate || "-"}</td>

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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="loans-history-totals">
        <div className="loans-history-total-card">
          <span>💵 Total Repayment</span>
          <strong>{formatMoney(totalRepayment)}</strong>
          <p>Inguzanyo zose hamwe n'inyungu</p>
        </div>

        <div className="loans-history-total-card">
          <span>✅ Amount Paid</span>
          <strong>{formatMoney(paidAmount)}</strong>
          <p>Agaciro k'inguzanyo zashyizwe kuri Paid</p>
        </div>

        <div className="loans-history-total-card">
          <span>⏳ Amount Pending</span>
          <strong>{formatMoney(pendingAmount)}</strong>
          <p>Agaciro k'inguzanyo zitarishyurwa</p>
        </div>
      </div>

      <div className="loans-history-bottom">
        <button
          type="button"
          className="loans-primary-button"
          onClick={() => navigate("/loans")}
        >
          ⬅️ Back to Manage Loans
        </button>
      </div>
    </div>
  );
}

export default LoansHistory;