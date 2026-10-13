import PrimaryButton from "./primaryButton";

function Navbar() {
    return (
      <nav>
        <h2>IKIMINA</h2>
  
        <div>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/login">Login</a>
          <PrimaryButton name="Get started"/>
        </div>
      </nav>
    );
  }
  
  export default Navbar;