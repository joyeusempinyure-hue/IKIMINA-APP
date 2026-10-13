
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinIkimina() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!code.trim()) {
      alert("Please enter the Ikimina code.");
      return;
    }

    const savedIkimina = localStorage.getItem("ikiminaData");

    if (!savedIkimina) {
      alert("No Ikimina found. Please create an Ikimina first.");
      return;
    }

    const ikimina = JSON.parse(savedIkimina);

    if (
      code.trim().toUpperCase() !==
      ikimina.code.toUpperCase()
    ) {
      alert("Invalid Ikimina code.");
      return;
    }

    const savedUser = localStorage.getItem("ikiminaUser");

    if (!savedUser) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    const user = JSON.parse(savedUser);

    const savedMembers =
      JSON.parse(localStorage.getItem("ikiminaMembers")) || [];

    const alreadyMember = savedMembers.some(
      (member) =>
        member.email?.toLowerCase() ===
        user.email?.toLowerCase()
    );

    if (alreadyMember) {
      alert("You are already a member of this Ikimina.");
      navigate("/dashboard");
      return;
    }

    const newMember = {
      id: Date.now(),
      name: user.fullName || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
    };

    const updatedMembers = [
      ...savedMembers,
      newMember,
    ];

    localStorage.setItem(
      "ikiminaMembers",
      JSON.stringify(updatedMembers)
    );

    alert(
      `You joined ${ikimina.name} successfully!`
    );

    navigate("/dashboard");
  };

  return (
    <div
      className="page-container"
      style={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        className="form-card"
        style={{
          width: "100%",
          maxWidth: "550px",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "50px",
              marginBottom: "10px",
            }}
          >
            🤝
          </div>

          <h1
            style={{
              fontSize: "32px",
              marginBottom: "10px",
            }}
          >
            Join Ikimina
          </h1>

          <p
            style={{
              fontSize: "16px",
              color: "#64748b",
              margin: 0,
            }}
          >
            Enter the Ikimina code to join your group.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "25px" }}>
            <label
              style={{
                display: "block",
                fontWeight: "600",
                fontSize: "16px",
                marginBottom: "10px",
              }}
            >
              Ikimina Code
            </label>

            <input
              type="text"
              placeholder="Example: IKIMINA1234"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase())
              }
              style={{
                width: "100%",
                height: "55px",
                padding: "0 16px",
                fontSize: "18px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              height: "58px",
              border: "none",
              borderRadius: "10px",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              background: "#2563eb",
              color: "#ffffff",
            }}
          >
            🤝 Join Ikimina
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          style={{
            width: "100%",
            height: "55px",
            marginTop: "15px",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            background: "#ffffff",
            color: "#334155",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default JoinIkimina;
