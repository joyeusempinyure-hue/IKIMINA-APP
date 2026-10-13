function ProtectedRoute({ children }) {
    const user = localStorage.getItem("ikiminaUser");
  
    if (!user) {
      return <Navigate to="/login" replace />;
    }
  
    return children;
  }

  export default ProtectedRoute