import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Friends from "./Pages/Friends";
import Messages from "./Pages/Messages";
import Login from "./Pages/Login";
import Signin from "./Pages/Signin";
import Welcome from "./Pages/Welcome";
import AddFriends from "./Pages/AddFriends"; 
import Account from "./Pages/Account";
import GroupChats from "./Pages/GroupChats";


import Personalization from "./Pages/Personalization";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/addfriends" element={<AddFriends />} /> 
        <Route path="/account" element={<Account />} />
        <Route path="/groupchats" element={<GroupChats />} />
        <Route path="/personalization" element={<Personalization />} />
      </Routes>
    </Router>
  );
}

export default App; 