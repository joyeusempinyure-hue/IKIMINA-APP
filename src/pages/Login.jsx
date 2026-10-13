import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    const savedUser = JSON.parse(
      localStorage.getItem("ikiminaUser")
    );

    if (!savedUser) {
      alert("No account found. Please create an account first.");
      return;
    }

    if (
      email !== savedUser.email ||
      password !== savedUser.password
    ) {
      alert("Invalid email or password.");
      return;
    }

    alert("Login successful!");

    navigate("/dashboard");
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>Welcome Back</h1>

        <p>Injira muri account yawe ya IKIMINA</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="register-btn">
            Login
          </button>
        </form>

        <p className="login-text">
          Don't have an account?{" "}
          <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;