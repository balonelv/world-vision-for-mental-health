import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase (set in Vercel env settings)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("home");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);

  // Admin login
  const login = async () => {
    const email = prompt("Admin email");
    const password = prompt("Password");
    const { data } = await supabase.auth.signInWithPassword({ email, password });
    if (data.user) setUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Load admin data
  const loadData = async () => {
    const { data: msgs } = await supabase.from("contacts").select("*");
    const { data: apps } = await supabase.from("appointments").select("*");
    setMessages(msgs || []);
    setAppointments(apps || []);
  };

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Contact form
  const handleSubmit = async (e) => {
    e.preventDefault();
    await supabase.from("contacts").insert([form]);
    alert("Message sent!");
    setForm({ name: "", email: "", message: "" });
  };

  // Appointment
  const bookAppointment = async () => {
    const name = prompt("Your Name");
    const date = prompt("Preferred Date");
    await supabase.from("appointments").insert([{ name, date }]);
    alert("Appointment requested!");
  };

  return (
    <div style={{ fontFamily: "Arial", padding: 20 }}>
      {/* NAV */}
      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setView("home")}>Home</button>{" "}
        <button onClick={() => setView("contact")}>Contact</button>{" "}
        <button onClick={() => setView("book")}>Book</button>{" "}
        {!user ? (
          <button onClick={login}>Admin Login</button>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </nav>

      {/* HOME */}
      {view === "home" && (
        <div>
          <h1>Mental Health Support</h1>
          <p>Accessible care for everyone</p>
          <button onClick={bookAppointment}>Book Session</button>
        </div>
      )}

      {/* CONTACT */}
      {view === "contact" && (
        <div>
          <h2>Contact</h2>
          <form onSubmit={handleSubmit}>
            <input
              placeholder="Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <br /><br />
            <input
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <br /><br />
            <textarea
              placeholder="Message"
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <br /><br />
            <button type="submit">Send</button>
          </form>
        </div>
      )}

      {/* ADMIN */}
      {user && (
        <div>
          <h2>Admin Dashboard</h2>

          <h3>Messages</h3>
          {messages.map((m, i) => (
            <div key={i}>
              {m.name} - {m.message}
            </div>
          ))}

          <h3>Appointments</h3>
          {appointments.map((a, i) => (
            <div key={i}>
              {a.name} - {a.date}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
