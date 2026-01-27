import { useEffect, useState } from "react";

function App() {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookings, setBookings] = useState([]);

  // Hae huoneet
  useEffect(() => {
    fetch("http://localhost:3001/api/rooms")
      .then(res => res.json())
      .then(setRooms);
  }, []);

  // Hae varaukset
  useEffect(() => {
    fetch("http://localhost:3001/api/bookings")
      .then(res => res.json())
      .then(setBookings);
  }, []);

  // Tee varaus
  const bookRoom = async () => {
    if (!roomId || !date || !time) return alert("Täytä kaikki kentät!");

    const response = await fetch("http://localhost:3001/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, date, time }),
    });

    if (response.status === 409) {
      const data = await response.json();
      return alert(data.message); // Näyttää: Huone on jo varattu tähän aikaan!
    }

    const newBooking = await response.json();
    setBookings(prev => [...prev, newBooking]); // Päivitä lista heti
    alert("Varaus tehty!");
  };

  // Poista varaus
  const deleteBooking = async (id) => {
    await fetch(`http://localhost:3001/api/bookings/${id}`, {
      method: "DELETE",
    });
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  const timeSlots = [];

for (let hour = 8; hour < 18; hour++) {
  timeSlots.push(`${String(hour).padStart(2, "0")}:00`);
  timeSlots.push(`${String(hour).padStart(2, "0")}:30`);
}

const availableTimes = timeSlots.filter(t => {
  return !bookings.some(b =>
    b.roomId === roomId &&
    b.date === date &&
    b.time === t
  );
});

const filteredBookings = roomId
  ? bookings.filter(b => b.roomId === roomId)
  : bookings;



  return (
    <div style={{ padding: 20 }}>
      <h1>Kokoushuonevaraus</h1>

      <select onChange={e => setRoomId(Number(e.target.value))} value={roomId}>
        <option value="">Valitse huone</option>
        {rooms.map(room => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      <br /><br />

      <input type="date"
      min={new Date().toISOString().split("T")[0]}
      onChange={e => setDate(e.target.value)} 
      value={date} />
      <select
  value={time}
  onChange={e => setTime(e.target.value)}
  disabled={!roomId || !date}
>
  <option value="">Valitse aika</option>

  {availableTimes.map(t => (
    <option key={t} value={t}>
      {t}
    </option>
  ))}
</select>


      <br /><br />

      <button onClick={bookRoom}>Varaa</button>

      <hr />

      <h2>Varaukset</h2>
      <ul>
        {filteredBookings.map(b => {
          const room = rooms.find(r => r.id === b.roomId);
          return (
            <li key={b.id}>
              {room ? room.name : "Tuntematon huone"} – {b.date} {b.time}
              <button
                style={{ marginLeft: 10 }}
                onClick={() => deleteBooking(b.id)}
              >
                Poista
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default App;


