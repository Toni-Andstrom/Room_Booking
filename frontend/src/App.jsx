import { useEffect, useState } from "react";

function App() {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [bookings, setBookings] = useState([]);

  // 🔹 Nykyinen päivä
  const today = new Date().toISOString().split("T")[0];

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
    if (!roomId || !date || !time || !name) return alert("Täytä kaikki kentät!");

    const response = await fetch("http://localhost:3001/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, date, time, name }),
    });

    if (response.status === 409) {
      const data = await response.json();
      return alert(data.message);
    }

    const newBooking = await response.json();
    setBookings(prev => [...prev, newBooking]);
    alert("Varaus tehty!");
  };

  // Poista varaus
  const deleteBooking = async (id) => {
    await fetch(`http://localhost:3001/api/bookings/${id}`, {
      method: "DELETE",
    });
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  // 🔹 Aikavälit
  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    timeSlots.push(`${String(hour).padStart(2, "0")}:00`);
    timeSlots.push(`${String(hour).padStart(2, "0")}:30`);
  }

  // 🔹 Vapaat ajat dropdowniin
  const availableTimes = timeSlots.filter(t => {
    if (!roomId || !date) return false;

    const now = new Date();
    const slotDateTime = new Date(`${date}T${t}:00`);

    return (
      (date !== today || slotDateTime > now) &&
      !bookings.some(
        b => b.roomId === roomId && b.date === date && b.time === t
      )
    );
  });

  // 🔹 Suodatetut + järjestetyt varaukset
  const filteredBookings = roomId
    ? bookings.filter(b => b.roomId === roomId)
    : bookings;

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

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

      <input
        type="date"
        min={today}
        onChange={e => setDate(e.target.value)}
        value={date}
      />

      <select
        value={time}
        onChange={e => setTime(e.target.value)}
        disabled={!roomId || !date}
      >
        <option value="">Valitse aika</option>
        {availableTimes.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <br /><br />

      <input
        type="text"
        placeholder="Varaajan nimi"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <br /><br />

      <button onClick={bookRoom}>Varaa</button>

      <hr />

      <h2>Varaukset</h2>
      <ul>
        {sortedBookings.map(b => {
          const room = rooms.find(r => r.id === b.roomId);
          return (
            <li key={b.id}>
              {room ? room.name : "Tuntematon huone"} – {b.date} {b.time}{" "}
              <strong>({b.name})</strong>
              <button style={{ marginLeft: 10 }} onClick={() => deleteBooking(b.id)}>
                Poista
              </button>
            </li>
          );
        })}
      </ul>

      <h2>Päivän varaukset</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Aika</th>
            {rooms.map(room => (
              <th key={room.id}>{room.name}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {timeSlots.map(time => (
            <tr key={time}>
              <td>{time}</td>

              {rooms.map(room => {
                const booking = bookings.find(
                  b =>
                    b.roomId === room.id &&
                    b.date === date &&
                    b.time === time
                );

                const slotDateTime = new Date(`${date}T${time}:00`);
                const now = new Date();
                const isPast = date === today && slotDateTime < now;

                let bgColor = "";
                if (isPast) bgColor = "#eeeeee";        // harmaa
                else if (booking) bgColor = "#f8d7da";  // punainen
                else bgColor = "#d4edda";               // vihreä

                return (
                  <td
                    key={room.id + time}
                    style={{ backgroundColor: bgColor }}
                  >
                    {booking
                      ? booking.name
                      : isPast
                      ? "Mennyt"
                      : "Vapaa"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
