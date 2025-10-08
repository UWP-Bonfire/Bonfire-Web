import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Friends from "./Pages/Friends";
import Messages from "./Pages/Messages";
import Login from "./Pages/Login";
import Signin from "./Pages/Signin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/friends" element={<Friends />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
      </Routes>
    </Router>
  );
}

export default App;

