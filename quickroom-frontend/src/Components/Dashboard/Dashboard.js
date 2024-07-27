import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';

export default function Dashboard() {
  const [data, setData] = useState({ customers: 0, agents: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');

  useEffect(() => {
    // Get the role from local storage
    const storedRole = localStorage.getItem('role');
    setRole(storedRole);

    fetch('https://p3odc2kz33kyyt43toqv3aerry0ylgvp.lambda-url.us-east-1.on.aws/')
      .then(response => response.json())
      .then(data => {
        const customers = data.Customers;
        const agents = data.Agents;
        const totalUsers = customers + agents;
        setData({ customers, agents, totalUsers });
        setLoading(false); 
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false); 
      });
  }, []);

  if (loading) {
    return (
      <div>
        <Navbar />
        <h1>Dashboard</h1>
        <p>Loading...</p> {/* Show loading message */}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      {role === 'agent' ? (
        <>
        <h1>Dashboard</h1>
      <div>
        <p>Total Agents: {data.agents}</p>
        <p>Total Users: {data.customers}</p>
        <p>All Users: {data.totalUsers}</p>
      </div>
      <iframe
          src="https://lookerstudio.google.com/embed/reporting/66a1d258-ec31-420c-a46e-35ef6aa2716b/page/5Oa6D"
          title="Embedded Content"
          width="80%"
          height="600px"
          style={{ border: 'none' }}
        />
        </>
        
      ) : (
        <h1>Only agents can access the dashboard.</h1>
      )}
    </>
  );
}
