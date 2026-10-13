
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error(`Ikibazo mu gusoma ${key}:`, error);
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

function MyIkimina() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = readStorage("ikiminaUser", null);

    if (!user) {
      navigate("/login");
      setLoading(false);
      return;
    }

    const userEmail = (user.email || "").trim().toLowerCase();

    const savedGroups = readStorage("ikiminaGroups", []);
    const oldGroup = readStorage("ikiminaData", null);
    const members = readStorage("ikiminaMembers", []);

    let allGroups = [...savedGroups];

    // Kongera ikimina cya kera niba kitari muri list
    if (
      oldGroup &&
      !allGroups.some(
        (group) =>
          group.code &&
          oldGroup.code &&
          String(group.code).toLowerCase() ===
            String(oldGroup.code).toLowerCase()
      )
    ) {
      allGroups.push({
        ...oldGroup,
        id: oldGroup.id || `legacy-${oldGroup.code || Date.now()}`,
      });
    }

    // Guhuza amakuru y'ikimina n'abanyamuryango
    const myGroups = allGroups.filter((group) => {
      const createdByUser =
        String(group.createdBy || "").trim().toLowerCase() ===
        userEmail;

      const groupKeys = getGroupKeys(group);

      const isMember = members.some((member) => {
        const memberEmail = (member.email || "")
          .trim()
          .toLowerCase();

        const memberGroupId = String(member.ikiminaId ?? "")
          .trim()
          .toLowerCase();

        return (
          memberEmail === userEmail &&
          groupKeys.includes(memberGroupId)
        );
      });

      const isLegacyGroup =
        Boolean(group.code && oldGroup?.code) &&
        String(group.code).toLowerCase() ===
          String(oldGroup.code).toLowerCase() &&
        members.some(
          (member) =>
            (member.email || "").trim().toLowerCase() === userEmail
        );

      return createdByUser || isMember || isLegacyGroup;
    });

    localStorage.setItem(
      "ikiminaGroups",
      JSON.stringify(allGroups)
    );

    setGroups(myGroups);
    setLoading(false);
  }, [navigate]);

  const openIkimina = (group) => {
    const groupId = group.id ?? group.code ?? group.name;

    if (!groupId) {
      alert("Iki kimina nta ID cyangwa code gifite.");
      return;
    }

    localStorage.setItem("activeIkiminaId", String(groupId));
    localStorage.setItem("ikiminaData", JSON.stringify(group));

    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="my-ikimina-page">
        <p>Turimo gushaka amakimina yawe...</p>
      </div>
    );
  }

  return (
    <div className="my-ikimina-page">
      <div className="my-ikimina-header">
        <div>
          <h1>My Ikimina</h1>
          <p>Hitamo ikimina ushaka gucunga.</p>
        </div>

        <button
          type="button"
          className="my-ikimina-primary-btn"
          onClick={() => navigate("/create-ikimina")}
        >
          + Create Ikimina
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="my-ikimina-empty">
          <div className="my-ikimina-empty-icon">🤝</div>
          <h2>Nta kimina urabona</h2>
          <p>
            Ushobora gukora ikimina gishya cyangwa kwinjira mu
            kimina ukoresheje code.
          </p>

          <div className="my-ikimina-empty-actions">
            <button
              type="button"
              className="my-ikimina-primary-btn"
              onClick={() => navigate("/create-ikimina")}
            >
              + Kora Ikimina
            </button>

            <button
              type="button"
              className="my-ikimina-secondary-btn"
              onClick={() => navigate("/join-ikimina")}
            >
              Injira mu Kimina
            </button>
          </div>
        </div>
      ) : (
        <div className="my-ikimina-grid">
          {groups.map((group) => (
            <div
              className="my-ikimina-card"
              key={group.id || group.code || group.name}
            >
              <div className="my-ikimina-card-icon">👥</div>

              <h2>{group.name || "Ikimina kitagira izina"}</h2>

              <p>
                <strong>Code:</strong>{" "}
                {group.code || "Nta code"}
              </p>

              <p>
                <strong>Contribution:</strong>{" "}
                {Number(group.amount || 0).toLocaleString("en-US")} RWF
              </p>

              <p>
                <strong>Frequency:</strong>{" "}
                {group.frequency || "Ntabwo isobanuwe"}
              </p>

              <p>
                <strong>Start date:</strong>{" "}
                {group.startDate || "Ntabwo isobanuwe"}
              </p>

              <button
                type="button"
                className="my-ikimina-primary-btn my-ikimina-open-btn"
                onClick={() => openIkimina(group)}
              >
                Fungura Ikimina →
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="my-ikimina-secondary-btn my-ikimina-back-btn"
        onClick={() => navigate("/dashboard")}
      >
        ← Subira kuri Dashboard
      </button>
    </div>
  );
}

export default MyIkimina;