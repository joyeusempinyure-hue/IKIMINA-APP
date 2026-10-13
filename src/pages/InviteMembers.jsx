
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../components/primaryButton";
import "./InviteMembers.css";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
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

function getGroupId(group) {
  return group?.id ?? group?.code ?? group?.name ?? "";
}

function InviteMembers() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ikimina, setIkimina] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
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

    setIkimina(selectedGroup);

    const savedMembers = readStorage("ikiminaMembers", []);
    setMembers(savedMembers);
  };

  const groupMembers = members.filter((member) => {
    if (!ikimina) return false;

    return getGroupKeys(ikimina).includes(
      String(member.ikiminaId ?? "").trim().toLowerCase()
    );
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!ikimina) {
      alert("Banza uhitemo ikimina.");
      navigate("/my-ikimina");
      return;
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      alert("Uzuza amakuru yose y'umunyamuryango.");
      return;
    }

    const savedMembers = readStorage("ikiminaMembers", []);
    const groupId = getGroupId(ikimina);
    const normalizedEmail = email.trim().toLowerCase();

    const exists = savedMembers.some(
      (member) =>
        getGroupKeys(ikimina).includes(
          String(member.ikiminaId ?? "").trim().toLowerCase()
        ) &&
        (member.email || "").trim().toLowerCase() === normalizedEmail
    );

    if (exists) {
      alert("Uyu munyamuryango asanzwe ari muri iki kimina.");
      return;
    }

    const newMember = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ikiminaId: groupId,
      ikiminaName: ikimina.name || "",
      ikiminaCode: ikimina.code || "",
      name: name.trim(),
      fullName: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      joinedAt: new Date().toISOString(),
    };

    const updatedMembers = [...savedMembers, newMember];

    localStorage.setItem(
      "ikiminaMembers",
      JSON.stringify(updatedMembers)
    );

    setMembers(updatedMembers);
    setName("");
    setEmail("");
    setPhone("");

    alert("Umunyamuryango yongewemo neza!");
  };

  return (
    <div className="invite-members-page">
      <div className="invite-members-header">
        <div>
          <h1>Invite Members</h1>
          <p>Ongeramo kandi ucunge abanyamuryango ba IKIMINA.</p>
        </div>

        <PrimaryButton
          name="Back to Dashboard"
          icon="⬅️"
          link="/dashboard"
        />
      </div>

      <div className="invite-members-summary">
        <div className="invite-summary-card">
          <div className="invite-summary-icon">👥</div>
          <div>
            <h3>Total Members</h3>
            <h2>{groupMembers.length}</h2>
            <span>Abanyamuryango b'iki kimina</span>
          </div>
        </div>

        <div className="invite-summary-card">
          <div className="invite-summary-icon">🏦</div>
          <div>
            <h3>Selected Ikimina</h3>
            <h2 className="invite-group-name">
              {ikimina?.name || "Nta kimina"}
            </h2>
            <span>
              {ikimina?.code
                ? `Code: ${ikimina.code}`
                : "Ikimina wahisemo"}
            </span>
          </div>
        </div>
      </div>

      <div className="invite-members-content">
        <div className="invite-members-form-card">
          <div className="invite-form-heading">
            <div className="invite-form-heading-icon">➕</div>
            <div>
              <h2>Add New Member</h2>
              <p>Andika amakuru y'umunyamuryango mushya.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="invite-form-grid">
              <div className="invite-form-field">
                <label htmlFor="invite-name">Amazina yuzuye</label>
                <input
                  id="invite-name"
                  type="text"
                  placeholder="Urugero: Jean Paul"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="invite-form-field">
                <label htmlFor="invite-email">Email</label>
                <input
                  id="invite-email"
                  type="email"
                  placeholder="Urugero: jean@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="invite-form-field invite-full-width">
                <label htmlFor="invite-phone">Numero ya telefone</label>
                <input
                  id="invite-phone"
                  type="tel"
                  placeholder="Urugero: 0780000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="invite-form-actions">
              <button
                type="button"
                className="invite-cancel-btn"
                onClick={() => navigate("/members")}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="invite-save-btn"
                disabled={!ikimina}
              >
                ➕ Add Member
              </button>
            </div>

            {!ikimina && (
              <p className="invite-form-warning">
                Nta kimina cyatoranyijwe. Banza uhitemo ikimina.
              </p>
            )}
          </form>
        </div>

        <div className="invite-members-note">
          <span>💡</span>
          <div>
            <strong>Wibuke</strong>
            <p>
              Abanyamuryango babikwa ku kimina cyatoranyijwe kandi
              bagomba kugaragara muri Members na Manage Contributions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InviteMembers;