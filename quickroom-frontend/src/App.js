import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Home from "./Components/Home/Home"
import Login from "./Components/Login/Login"
import Signup from "./Components/Signup/Signup";
import Feedback from "./Components/Feedback/Feeback";
import Rooms from "./Components/Rooms/Rooms";
import AllReviews from "./Components/AllReviews/AllReviews";
import Dashboard from "./Components/Dashboard/Dashboard";
import BookingForm from "./Components/BookingForm/BookingForm"
import ManageRooms from "./Components/ManageRooms/ManageRooms";
import LiveChatBotWindow from "./Components/LiveChatBotWindow/LiveChatBotWindow";


function App() {


  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} /> 
          <Route path="/register" element={<Signup />} /> 
          <Route path="/feedback" element={<Feedback />}></Route>
          <Route path="/rooms" element={<Rooms />}></Route>
          <Route path="/reviews" element={<AllReviews />}></Route>
          <Route path="/dashboard" element={<Dashboard />}></Route>
          <Route path="/register" element={<Signup />} />
          <Route path="/bookings" element={<BookingForm />} />
          <Route path="/managerooms" element={<ManageRooms />} />
        </Routes>
      </Router>
      <LiveChatBotWindow></LiveChatBotWindow>
    </div>
  );
}

export default App;
