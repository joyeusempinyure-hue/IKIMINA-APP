
import "./App.css";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateIkimina from "./pages/CreateIkimina";
import JoinIkimina from "./pages/JoinIkimina";
import MyIkimina from "./pages/MyIkimina";
import InviteMembers from "./pages/InviteMembers";
import ManageContributions from "./pages/ManageContributions";
import Rotation from "./pages/Rotation.jsx";
import Loans from "./pages/Loans";
import LoansHistory from "./pages/LoansHistory";
import Fund from "./pages/Fund.jsx";
import Settlement from "./pages/Settlement.jsx";
import SettlementHistory from "./pages/SettlementHistory.jsx";
import Members from "./pages/Members.jsx";
import MemberDetails from "./pages/MemberDetails.jsx";
import ProtectedRoute from "./components/protection.jsx";
import Home from "./pages/home.jsx";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Home />} />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/my-ikimina"
          element={
            <ProtectedRoute>
              <MyIkimina />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-ikimina"
          element={
            <ProtectedRoute>
              <CreateIkimina />
            </ProtectedRoute>
          }
        />

       
        <Route
          path="/join-ikimina"
          element={
            <ProtectedRoute>
              <JoinIkimina />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/invite-members"
          element={
            <ProtectedRoute>
              <InviteMembers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-contributions"
          element={
            <ProtectedRoute>
              <ManageContributions />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/rotation"
          element={
            <ProtectedRoute>
              <Rotation />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <Loans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/loans-history"
          element={
            <ProtectedRoute>
              <LoansHistory />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/fund"
          element={
            <ProtectedRoute>
              <Fund />
            </ProtectedRoute>
          }
        />

      
        <Route
          path="/settlement"
          element={
            <ProtectedRoute>
              <Settlement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settlement-history"
          element={
            <ProtectedRoute>
              <SettlementHistory />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />

        <Route
          path="/member/:id"
          element={
            <ProtectedRoute>
              <MemberDetails />
            </ProtectedRoute>
          }
        />

        
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

