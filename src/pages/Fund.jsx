import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Fund() {
  const navigate = useNavigate();

  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    try {
      const savedContributions = JSON.parse(
        localStorage.getItem("ikiminaContributions") || "[]"
      );

      const savedLoans = JSON.parse(
        localStorage.getItem("ikiminaLoans") || "[]"
      );

      const activeIkiminaId =
        localStorage.getItem("activeIkiminaId");

      const filterByIkimina = (items) => {
        if (!activeIkiminaId) {
          return items;
        }

        return items.filter((item) => {
          
          if (item.ikiminaId == null) {
            return true;
          }

          return (
            String(item.ikiminaId) ===
            String(activeIkiminaId)
          );
        });
      };

      setContributions(
        filterByIkimina(
          Array.isArray(savedContributions)
            ? savedContributions
            : []
        )
      );

      setLoans(
        filterByIkimina(
          Array.isArray(savedLoans) ? savedLoans : []
        )
      );
    } catch (error) {
      console.error("Error loading IKIMINA Fund:", error);
      setContributions([]);
      setLoans([]);
    }
  }, []);

  const toNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const formatMoney = (amount) =>
    toNumber(amount).toLocaleString("en-US", {
      maximumFractionDigits: 2,
    });

  
  const getLoanInterest = (loan) => {
    const amount = toNumber(loan.amount);

    if (
      loan.interest !== undefined &&
      loan.interest !== null &&
      loan.interest !== ""
    ) {
      return Math.max(0, toNumber(loan.interest));
    }

    if (
      loan.interestAmount !== undefined &&
      loan.interestAmount !== null &&
      loan.interestAmount !== ""
    ) {
      return Math.max(0, toNumber(loan.interestAmount));
    }

    const totalToPay = loan.totalToPay ?? loan.total;

    if (totalToPay !== undefined && totalToPay !== null) {
      return Math.max(0, toNumber(totalToPay) - amount);
    }

    return Math.max(
      0,
      (amount * toNumber(loan.interestRate)) / 100
    );
  };

 
  const totalContributions = contributions.reduce(
    (total, contribution) =>
      total + toNumber(contribution.amount),
    0
  );

  
  const paidLoans = loans.filter(
    (loan) =>
      String(loan.status || "").toLowerCase() === "paid"
  );

  const pendingLoans = loans.filter(
    (loan) =>
      String(loan.status || "").toLowerCase() !== "paid"
  );

  
  const totalLoans = loans.reduce(
    (total, loan) => total + toNumber(loan.amount),
    0
  );

  
  const totalPaidLoanPrincipal = paidLoans.reduce(
    (total, loan) => total + toNumber(loan.amount),
    0
  );

  
  const totalLoanInterest = paidLoans.reduce(
    (total, loan) => total + getLoanInterest(loan),
    0
  );

  
  const outstandingLoans = pendingLoans.reduce(
    (total, loan) => total + toNumber(loan.amount),
    0
  );

  
  const availableFund =
    totalContributions -
    outstandingLoans +
    totalLoanInterest;

  const totalProfit = totalLoanInterest;

  return (
    <div className="dashboard">
      
      <div className="dashboard-header">
        <div>
          <h1>Ikimina Fund 💰</h1>
          <p>
            Reba uko amafaranga ya IKIMINA ahagaze.
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Contributions</h3>
          <p>{formatMoney(totalContributions)} RWF</p>
          <span>Amafaranga abanyamuryango batanze</span>
        </div>

        <div className="dashboard-card">
          <h3>Loans Given</h3>
          <p>{formatMoney(totalLoans)} RWF</p>
          <span>Amafaranga yose yatanzwe nk'inguzanyo</span>
        </div>

        <div className="dashboard-card">
          <h3>Loan Interest</h3>
          <p>{formatMoney(totalLoanInterest)} RWF</p>
          <span>Inyungu z'inguzanyo zishyuwe</span>
        </div>

        <div className="dashboard-card">
          <h3>Available Fund</h3>
          <p>{formatMoney(availableFund)} RWF</p>
          <span> amafaranga abarwa ko ari muri Fund</span>
        </div>
      </div>

      
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Outstanding Loans</h3>
          <p>{formatMoney(outstandingLoans)} RWF</p>
          <span>Principal y'inguzanyo zitarishyurwa</span>
        </div>

        <div className="dashboard-card">
          <h3>Paid Loans</h3>
          <p>{paidLoans.length}</p>
          <span>Inguzanyo zamaze kwishyurwa</span>
        </div>

        <div className="dashboard-card">
          <h3>Pending Loans</h3>
          <p>{pendingLoans.length}</p>
          <span>Inguzanyo zitarishyurwa</span>
        </div>

        <div className="dashboard-card">
          <h3>Total Profit</h3>
          <p>{formatMoney(totalProfit)} RWF</p>
          <span>Inyungu zakiriwe ziturutse ku nguzanyo</span>
        </div>
      </div>

     
      <div
        className="dashboard-section"
        style={{ marginTop: "30px" }}
      >
        <h2>Fund Summary 📊</h2>

        <div style={{ overflowX: "auto", marginTop: "20px" }}>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Member Contributions</td>
                <td>{formatMoney(totalContributions)} RWF</td>
              </tr>

              <tr>
                <td>Total Loans Given (historical)</td>
                <td>{formatMoney(totalLoans)} RWF</td>
              </tr>

              <tr>
                <td>Outstanding Loan Principal</td>
                <td>- {formatMoney(outstandingLoans)} RWF</td>
              </tr>

              <tr>
                <td>Paid Loan Principal Returned</td>
                <td>{formatMoney(totalPaidLoanPrincipal)} RWF</td>
              </tr>

              <tr>
                <td>Loan Interest Received</td>
                <td>+ {formatMoney(totalLoanInterest)} RWF</td>
              </tr>

              <tr>
                <td>
                  <strong>Available IKIMINA Fund</strong>
                </td>
                <td>
                  <strong>
                    {formatMoney(availableFund)} RWF
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: "15px", lineHeight: "1.7" }}>
          Amafaranga aboneka abarwa hakoreshejwe imisanzu yose,
          hagakurwamo principal y'inguzanyo zitarishyurwa,
          hongerwaho inyungu z'inguzanyo zishyuwe. Principal
          y'inguzanyo zishyuwe igaragara nk'amakuru y'amateka,
          ntibongera kongerwa ku mafaranga aboneka.
        </p>
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
            <h2>Loan Information 🏦</h2>
            <p style={{ marginTop: "5px" }}>
              Reba inguzanyo zose n'uko zihagaze.
            </p>
          </div>

          <button
            className="dashboard-action-btn"
            onClick={() => navigate("/loans")}
          >
            Manage Loans
          </button>
        </div>

        {loans.length === 0 ? (
          <div
            className="empty-state"
            style={{
              textAlign: "center",
              padding: "30px",
            }}
          >
            <p>Nta nguzanyo iraboneka.</p>

            <button
              className="dashboard-action-btn"
              style={{ marginTop: "15px" }}
              onClick={() => navigate("/loans")}
            >
              Add Loan
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member</th>
                  <th>Amount</th>
                  <th>Interest</th>
                  <th>Total To Pay</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {loans.map((loan, index) => {
                  const amount = toNumber(loan.amount);
                  const interest = getLoanInterest(loan);

                  const totalToPay = toNumber(
                    loan.totalToPay ??
                      loan.total ??
                      amount + interest
                  );

                  const isPaid =
                    String(loan.status || "").toLowerCase() ===
                    "paid";

                  return (
                    <tr key={loan.id || index}>
                      <td>{index + 1}</td>

                      <td>
                        <strong>
                          {loan.memberName ||
                            loan.fullName ||
                            "-"}
                        </strong>
                      </td>

                      <td>{formatMoney(amount)} RWF</td>

                      <td>
                        {formatMoney(interest)} RWF
                        <br />
                        <small>
                          ({toNumber(loan.interestRate)}%)
                        </small>
                      </td>

                      <td>
                        <strong>
                          {formatMoney(totalToPay)} RWF
                        </strong>
                      </td>

                      <td>{loan.date || "-"}</td>

                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            background: isPaid
                              ? "#dcfce7"
                              : "#fef3c7",
                            color: isPaid
                              ? "#166534"
                              : "#92400e",
                            fontWeight: "600",
                          }}
                        >
                          {isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      
      <div
        className="dashboard-section"
        style={{
          marginTop: "30px",
          textAlign: "center",
        }}
      >
        <h2>How IKIMINA Fund Works 💡</h2>

        <p
          style={{
            marginTop: "15px",
            lineHeight: "1.8",
          }}
        >
          Imisanzu y'abanyamuryango ni yo shingiro rya Fund.
          Iyo ikimina gitanga inguzanyo, amafaranga ava muri
          Fund akajya ku muntu uyifashe. Iyo yishyuye, principal
          igaruka muri Fund, naho inyungu yishyuwe ikongerera
          ikimina amafaranga. Inyungu zishobora kugabanywa mu
          gihe cya settlement hakurikijwe amategeko y'ikimina.
        </p>

        <button
          className="dashboard-action-btn"
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/loans-history")}
        >
          View Loans History
        </button>
      </div>
    </div>
  );
}

export default Fund;