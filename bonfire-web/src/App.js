import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Friends from "./Pages/Friends";
import Messages from "./Pages/Messages";
import Login from "./Pages/Login";
import Signin from "./Pages/Signin";
import Welcome from "./Pages/Welcome";
import AddFriends from "./Pages/AddFriends"; 

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route now goes to Welcome */}
        <Route path="/" element={<Welcome />} />

        <Route path="/friends" element={<Friends />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/addfriends" element={<AddFriends />} /> 
      </Routes>
    </Router>
  );
}

export default App;
