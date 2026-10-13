import { useEffect, useState } from "react";
import PrimaryButton from "../components/primaryButton";

function Members() {
  const [members, setMembers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedMembers =
      JSON.parse(localStorage.getItem("ikiminaMembers")) || [];

    const savedContributions =
      JSON.parse(localStorage.getItem("ikiminaContributions")) || [];

    const savedLoans =
      JSON.parse(localStorage.getItem("ikiminaLoans")) || [];

    let changed = false;

    const fixedMembers = savedMembers.map((member, index) => {
      const memberName =
        member.name ||
        member.fullName ||
        "";

      let memberId = member.id;

      if (!memberId) {
        memberId = Date.now() + index;
        changed = true;
      }

      if (member.name !== memberName) {
        changed = true;
      }

      return {
        ...member,
        id: memberId,
        name: memberName,
        email: member.email || "",
        phone: member.phone || "",
      };
    });

    if (changed) {
      localStorage.setItem(
        "ikiminaMembers",
        JSON.stringify(fixedMembers)
      );
    }

    setMembers(fixedMembers);
    setContributions(savedContributions);
    setLoans(savedLoans);
  };

  const getMemberName = (member) => {
    return (
      member.name ||
      member.fullName ||
      "-"
    );
  };

  const getMemberContribution = (member) => {
    const memberName = getMemberName(member)
      .toLowerCase()
      .trim();

    return contributions
      .filter((item) => {
        const sameId =
          item.memberId &&
          String(item.memberId) === String(member.id);

        const contributionName =
          item.memberName
            ?.toLowerCase()
            .trim();

        const sameName =
          contributionName &&
          contributionName === memberName;

        return sameId || sameName;
      })
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );
  };

  const getMemberLoans = (member) => {
    const memberName = getMemberName(member)
      .toLowerCase()
      .trim();

    return loans
      .filter((loan) => {
        const sameId =
          loan.memberId &&
          String(loan.memberId) === String(member.id);

        const loanName =
          loan.memberName
            ?.toLowerCase()
            .trim();

        const sameName =
          loanName &&
          loanName === memberName;

        return sameId || sameName;
      })
      .reduce(
        (total, loan) =>
          total + Number(loan.amount || 0),
        0
      );
  };

  const filteredMembers = members.filter((member) => {
    const value = search.toLowerCase().trim();

    const name = getMemberName(member)
      .toLowerCase();

    const email = (member.email || "")
      .toLowerCase();

    const phone = (member.phone || "")
      .toLowerCase();

    return (
      name.includes(value) ||
      email.includes(value) ||
      phone.includes(value)
    );
  });

  const formatMoney = (amount) => {
    return (
      Number(amount || 0).toLocaleString("en-US") +
      " RWF"
    );
  };

  const totalContributions = contributions.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const totalLoans = loans.reduce(
    (total, loan) =>
      total + Number(loan.amount || 0),
    0
  );

  return (
    <div className="members-page">

      <div className="members-header">

        <div>
          <h1>Members</h1>

          <p>
            Abanyamuryango ba IKIMINA
          </p>
        </div>

        <div className="members-header-button">
          <PrimaryButton
            name="Back to Dashboard"
            icon="⬅️"
            link="/dashboard"
          />
        </div>

      </div>
      <div className="members-summary">

        <div className="members-summary-card">

          <div className="summary-icon">
            👥
          </div>

          <div>
            <h3>Total Members</h3>

            <h2>
              {members.length}
            </h2>

            <span>
              Abanyamuryango bose
            </span>
          </div>

        </div>


        <div className="members-summary-card">

          <div className="summary-icon">
            💰
          </div>

          <div>
            <h3>Total Contributions</h3>

            <h2>
              {formatMoney(totalContributions)}
            </h2>

            <span>
              Amafaranga yatanzwe
            </span>
          </div>

        </div>


        <div className="members-summary-card">

          <div className="summary-icon">
            💳
          </div>

          <div>
            <h3>Total Loans</h3>

            <h2>
              {formatMoney(totalLoans)}
            </h2>

            <span>
              Amafaranga yatijwe
            </span>
          </div>

        </div>

      </div>
      <div className="members-search-card">

        <div className="members-search-top">

          <div className="search-title">

            <h3>
              Search Members
            </h3>

            <p>
              Shakisha umunyamuryango ukoresheje
              izina, email cyangwa telefone.
            </p>

          </div>


          <div className="search-box">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}

          </div>

        </div>

      </div>

      <div className="members-table-card">

        <div className="members-table-header">

          <div>
            <h2>
              All Members
            </h2>

            <p>
              Abanyamuryango bose ba IKIMINA
            </p>
          </div>

          <div className="members-count">
            {filteredMembers.length} Members
          </div>

        </div>


        <div className="members-table-container">

          <table className="members-table">

            <thead>

              <tr>

                <th>ID</th>

                <th>Name</th>

                <th>Email</th>

                <th>Phone</th>

                <th>Contribution</th>

                <th>Loan</th>

                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {filteredMembers.length === 0 ? (

                <tr>

                  <td
                    colSpan="7"
                    className="members-empty"
                  >

                    <div>

                      <span className="empty-icon">
                        👥
                      </span>

                      <h3>
                        No members found
                      </h3>

                      <p>
                        Nta munyamuryango uhuye
                        n'ibyo washakishije.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredMembers.map((member) => {

                  const memberName =
                    getMemberName(member);

                  return (

                    <tr key={member.id}>

                      <td>

                        <span className="member-id">
                          MEM-
                          {String(member.id).slice(-6)}
                        </span>

                      </td>

                      <td>

                        <div className="member-name-cell">

                          <div className="member-avatar">
                            {memberName
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {memberName}
                            </strong>

                          </div>

                        </div>

                      </td>
                      <td>
                        {member.email || "-"}
                      </td>

                      <td>
                        {member.phone || "-"}
                      </td>

                      <td>

                        <span className="contribution-amount">

                          {formatMoney(
                            getMemberContribution(member)
                          )}

                        </span>

                      </td>
                      <td>

                        <span className="loan-amount">

                          {formatMoney(
                            getMemberLoans(member)
                          )}

                        </span>

                      </td>

                      <td>

                        <div className="member-action">

                          <PrimaryButton
                            name="View Details"
                            icon="👁️"
                            link={`/member/${member.id}`}
                          />

                        </div>

                      </td>

                    </tr>

                  );

                })

              )}

            </tbody>

          </table>

        </div>

      </div>

      <div className="members-add-button">

        <PrimaryButton
          name="Add New Member"
          icon="➕"
          link="/invite-members"
        />

      </div>

    </div>
  );
}

export default Members;