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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
