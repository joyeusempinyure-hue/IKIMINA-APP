
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Rotation() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [ikimina, setIkimina] = useState(null);

  useEffect(() => {
    const savedMembers = localStorage.getItem("ikiminaMembers");
    const savedContributions = localStorage.getItem("ikiminaContributions");
    const savedLoans = localStorage.getItem("ikiminaLoans");
    const savedIkimina = localStorage.getItem("ikiminaData");

    if (savedMembers) {
      setMembers(JSON.parse(savedMembers));
    }

    if (savedContributions) {
      setContributions(JSON.parse(savedContributions));
    }

    if (savedLoans) {
      setLoans(JSON.parse(savedLoans));
    }

    if (savedIkimina) {
      setIkimina(JSON.parse(savedIkimina));
    }
  }, []);

  const totalContributions = contributions.reduce(
    (total, contribution) => {
      return total + Number(contribution.amount || 0);
    },
    0
  );

  const totalLoanInterest = loans
    .filter((loan) => loan.status === "Paid")
    .reduce((total, loan) => {
      return total + Number(loan.interest || 0);
    }, 0);

  const totalLoans = loans.reduce((total, loan) => {
    return total + Number(loan.amount || 0);
  }, 0);

  const totalMembers = members.length;

  const interestPerMember =
    totalMembers > 0 ? totalLoanInterest / totalMembers : 0;

  const getMemberContribution = (member) => {
    return contributions
      .filter(
        (contribution) =>
          contribution.memberId === member.id ||
          contribution.memberName?.toLowerCase() ===
            member.name?.toLowerCase()
      )
      .reduce((total, contribution) => {
        return total + Number(contribution.amount || 0);
      }, 0);
  };

  const getMemberLoan = (member) => {
    return loans
      .filter(
        (loan) =>
          loan.memberId === member.id ||
          loan.memberName?.toLowerCase() === member.name?.toLowerCase()
      )
      .reduce((total, loan) => {
        return total + Number(loan.amount || 0);
      }, 0);
  };

  const getMemberInterest = (member) => {
    return loans
      .filter(
        (loan) =>
          loan.status === "Paid" &&
          (loan.memberId === member.id ||
            loan.memberName?.toLowerCase() === member.name?.toLowerCase())
      )
      .reduce((total, loan) => {
        return total + Number(loan.interest || 0);
      }, 0);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>IKIMINA Financial Overview</h1>
          <p>
            Reba uko contributions, loans n'inyungu bihagaze kugeza igihe cyo
            gusesa.
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      {ikimina && (
        <div
          className="dashboard-section"
          style={{ marginBottom: "30px" }}
        >
          <h2>Ikimina Information</h2>

          <div className="dashboard-grid">
            <div>
              <p>
                <strong>Ikimina:</strong> {ikimina.name}
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Contribution:</strong>{" "}
                {Number(ikimina.amount || 0).toLocaleString()} RWF
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Frequency:</strong> {ikimina.frequency}
              </p>
            </div>

            <div>
              <p>
                <strong>Start Date:</strong> {ikimina.startDate}
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Code:</strong> {ikimina.code}
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Members:</strong> {totalMembers}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Contributions</h3>
          <p>{totalContributions.toLocaleString()} RWF</p>
          <span>Amafaranga yose yatanzwe</span>
        </div>

        <div className="dashboard-card">
          <h3>Total Loans</h3>
          <p>{totalLoans.toLocaleString()} RWF</p>
          <span>Amafaranga yatijwe</span>
        </div>

        <div className="dashboard-card">
          <h3>Loan Interest</h3>
          <p>{totalLoanInterest.toLocaleString()} RWF</p>
          <span>Inyungu zishyuwe</span>
        </div>

        <div className="dashboard-card">
          <h3>Interest / Member</h3>
          <p>{interestPerMember.toLocaleString()} RWF</p>
          <span>Inyungu izagabanywa</span>
        </div>
      </div>

      <div className="dashboard-section" style={{ marginTop: "30px" }}>
        <h2>Profit Sharing at Settlement</h2>

        <p style={{ marginBottom: "20px" }}>
          Inyungu zose zavuye muri loans zishyuwe zizagabanywa abanyamuryango
          igihe IKIMINA kizaseswa.
        </p>

        {members.length === 0 ? (
          <p>Nta banyamuryango baraboneka.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Total Contribution</th>
                <th>Loan Taken</th>
                <th>Interest Paid</th>
                <th>Interest Share</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member, index) => (
                <tr key={member.id || index}>
                  <td>{index + 1}</td>

                  <td>
                    <strong>{member.name}</strong>
                  </td>

                  <td>
                    {getMemberContribution(member).toLocaleString()} RWF
                  </td>

                  <td>{getMemberLoan(member).toLocaleString()} RWF</td>

                  <td>
                    {getMemberInterest(member).toLocaleString()} RWF
                  </td>

                  <td>
                    <strong>
                      {interestPerMember.toLocaleString()} RWF
                    </strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div
        className="dashboard-section"
        style={{ marginTop: "30px", textAlign: "center" }}
      >
        <h2>Gusesa Ikimina</h2>

        <p style={{ marginBottom: "20px" }}>
          Iyo igihe cya IKIMINA kirangiye, kanda hano ukomeze kuri Settlement
          kugira ngo ubare kandi ugabanye inyungu abanyamuryango.
        </p>

        <button
          className="dashboard-action-btn"
          onClick={() => navigate("/settlement")}
        >
          Gusesa Ikimina
        </button>
      </div>
    </div>
  );
}

export default Rotation;

