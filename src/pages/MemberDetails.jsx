
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PrimaryButton from "../components/primaryButton";

function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    loadMemberData();
  }, [id]);

  const readStorage = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  const loadMemberData = () => {
    const savedMembers = readStorage("ikiminaMembers");
    const savedContributions = readStorage("ikiminaContributions");
    const savedLoans = readStorage("ikiminaLoans");

    // Shaka umunyamuryango ukoresheje ID.
    const foundMember = savedMembers.find(
      (item) => String(item.id) === String(id)
    );

    setMember(foundMember || null);
    setContributions(savedContributions);
    setLoans(savedLoans);

    if (foundMember) {
      setEditName(foundMember.name || foundMember.fullName || "");
      setEditEmail(foundMember.email || "");
      setEditPhone(foundMember.phone || "");
    }
  };

  const getMemberName = (item) =>
    item?.name || item?.fullName || "";

  const belongsToMember = (record, currentMember) => {
    const sameId =
      record.memberId !== undefined &&
      record.memberId !== null &&
      String(record.memberId) === String(currentMember.id);

    const recordName = String(record.memberName || "")
      .trim()
      .toLowerCase();

    const currentName = getMemberName(currentMember)
      .trim()
      .toLowerCase();

    const sameName = recordName !== "" && recordName === currentName;

    return sameId || sameName;
  };

  const handleSave = () => {
    if (!editName.trim()) {
      alert("Name is required.");
      return;
    }

    const savedMembers = readStorage("ikiminaMembers");
    const oldName = getMemberName(member).trim().toLowerCase();
    const newName = editName.trim();

    const updatedMembers = savedMembers.map((item) => {
      if (String(item.id) !== String(id)) return item;

      return {
        ...item,
        name: newName,
        email: editEmail.trim(),
        phone: editPhone.trim(),
      };
    });

    const updateRecords = (records) =>
      records.map((record) => {
        const recordName = String(record.memberName || "")
          .trim()
          .toLowerCase();

        const sameId =
          record.memberId !== undefined &&
          record.memberId !== null &&
          String(record.memberId) === String(member.id);

        const sameOldName =
          recordName !== "" && recordName === oldName;

        if (!sameId && !sameOldName) return record;

        return {
          ...record,
          memberId: member.id,
          memberName: newName,
        };
      });

    const updatedContributions = updateRecords(contributions);
    const updatedLoans = updateRecords(loans);

    localStorage.setItem("ikiminaMembers", JSON.stringify(updatedMembers));
    localStorage.setItem(
      "ikiminaContributions",
      JSON.stringify(updatedContributions)
    );
    localStorage.setItem("ikiminaLoans", JSON.stringify(updatedLoans));

    setMember({
      ...member,
      name: newName,
      email: editEmail.trim(),
      phone: editPhone.trim(),
    });

    setContributions(updatedContributions);
    setLoans(updatedLoans);
    setIsEditing(false);

    alert("Member information updated successfully!");
  };

  const handleCancel = () => {
    setEditName(getMemberName(member));
    setEditEmail(member.email || "");
    setEditPhone(member.phone || "");
    setIsEditing(false);
  };

  const handleDelete = () => {
    const memberName = getMemberName(member) || "this member";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${memberName}?`
    );

    if (!confirmed) return;

    const updatedMembers = readStorage("ikiminaMembers").filter(
      (item) => String(item.id) !== String(member.id)
    );

    localStorage.setItem("ikiminaMembers", JSON.stringify(updatedMembers));

    // Contributions n'inguzanyo biragumana amateka yabyo.
    alert(`${memberName} has been deleted successfully.`);
    navigate("/members");
  };

  if (!member) {
    return (
      <div className="member-details-page">
        <div className="member-not-found">
          <div className="member-not-found-icon">👤</div>
          <h2>Member not found</h2>
          <p>Uyu munyamuryango ntiyabonetse.</p>
          <div className="member-details-back">
            <PrimaryButton
              name="Back to Members"
              icon="⬅️"
              link="/members"
            />
          </div>
        </div>
      </div>
    );
  }

  const memberName = getMemberName(member) || "Unknown Member";

  const memberContributions = contributions.filter((item) =>
    belongsToMember(item, member)
  );

  const memberLoans = loans.filter((item) =>
    belongsToMember(item, member)
  );

  const totalContribution = memberContributions.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const totalLoan = memberLoans.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const totalInterest = memberLoans.reduce(
    (total, item) =>
      total + Number(item.interest ?? item.interestAmount ?? 0),
    0
  );

  const totalToPay = memberLoans.reduce((total, loan) => {
    const amount = Number(loan.amount || 0);
    const interest = Number(loan.interest ?? loan.interestAmount ?? 0);
    const repayment = Number(loan.totalToPay ?? amount + interest);
    return total + repayment;
  }, 0);

  const formatMoney = (amount) =>
    `${Number(amount || 0).toLocaleString("en-US")} RWF`;

  return (
    <div className="member-details-page">
      <div className="member-details-header">
        <div>
          <h1>Member Details 👤</h1>
          <p>Amakuru arambuye y'umunyamuryango.</p>
        </div>

        <div className="member-details-back">
          <PrimaryButton
            name="Back to Members"
            icon="⬅️"
            link="/members"
          />
        </div>
      </div>

      <section className="member-details-card">
        <div className="member-details-card-header">
          <div>
            <h2>Member Information</h2>
            <p>Amakuru y'ibanze y'umunyamuryango.</p>
          </div>

          {!isEditing && (
            <div className="member-details-actions">
              <button
                type="button"
                className="member-edit-button"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Member
              </button>

              <button
                type="button"
                className="member-delete-button"
                onClick={handleDelete}
              >
                🗑️ Delete Member
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <form
            className="member-edit-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleSave();
            }}
          >
            <label>
              Name
              <input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                placeholder="Enter member name"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
                placeholder="Enter email"
              />
            </label>

            <label>
              Phone
              <input
                type="text"
                value={editPhone}
                onChange={(event) => setEditPhone(event.target.value)}
                placeholder="Enter phone number"
              />
            </label>

            <div className="member-details-actions">
              <button className="member-save-button" type="submit">
                💾 Save Changes
              </button>
              <button
                className="member-cancel-button"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="member-information-grid">
            <div>
              <span>Name</span>
              <strong>{memberName}</strong>
            </div>
            <div>
              <span>Member ID</span>
              <strong>MEM-{String(member.id).slice(-6)}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{member.email || "-"}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{member.phone || "-"}</strong>
            </div>
          </div>
        )}
      </section>

      <section className="member-financial-summary">
        <div className="member-financial-card">
          <span>💰</span>
          <h3>Total Contribution</h3>
          <strong>{formatMoney(totalContribution)}</strong>
          <p>Amafaranga yose yatanzwe</p>
        </div>

        <div className="member-financial-card">
          <span>💳</span>
          <h3>Total Loan</h3>
          <strong>{formatMoney(totalLoan)}</strong>
          <p>Inguzanyo zose</p>
        </div>

        <div className="member-financial-card">
          <span>📈</span>
          <h3>Total Interest</h3>
          <strong>{formatMoney(totalInterest)}</strong>
          <p>Inyungu ku nguzanyo</p>
        </div>

        <div className="member-financial-card">
          <span>🧾</span>
          <h3>Total To Pay</h3>
          <strong>{formatMoney(totalToPay)}</strong>
          <p>Inguzanyo n'inyungu</p>
        </div>
      </section>

      <section className="member-details-card">
        <div className="member-history-heading">
          <h2>Contribution History</h2>
          <p>Contributions zakozwe n'uyu munyamuryango.</p>
        </div>

        {memberContributions.length === 0 ? (
          <div className="member-empty-history">
            Nta contribution uyu munyamuryango aratanga.
          </div>
        ) : (
          <div className="member-history-table-wrap">
            <table className="member-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {memberContributions.map((item, index) => (
                  <tr key={item.id ?? index}>
                    <td>{item.date || "-"}</td>
                    <td>{formatMoney(item.amount)}</td>
                    <td>
                      <span className="member-status">
                        {item.status || "Paid"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="member-details-card">
        <div className="member-history-heading">
          <h2>Loan History</h2>
          <p>Inguzanyo z'uyu munyamuryango.</p>
        </div>

        {memberLoans.length === 0 ? (
          <div className="member-empty-history">
            Nta loan uyu munyamuryango afite.
          </div>
        ) : (
          <div className="member-history-table-wrap">
            <table className="member-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Loan</th>
                  <th>Interest</th>
                  <th>Total To Pay</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {memberLoans.map((loan, index) => {
                  const amount = Number(loan.amount || 0);
                  const interest = Number(
                    loan.interest ?? loan.interestAmount ?? 0
                  );
                  const repayment = Number(
                    loan.totalToPay ?? amount + interest
                  );

                  return (
                    <tr key={loan.id ?? index}>
                      <td>{loan.date || "-"}</td>
                      <td>{formatMoney(amount)}</td>
                      <td>{formatMoney(interest)}</td>
                      <td>{formatMoney(repayment)}</td>
                      <td>
                        <span className="member-status">
                          {loan.status || "Pending"}
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
    </div>
  );
}

export default MemberDetails;