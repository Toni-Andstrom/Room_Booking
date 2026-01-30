import { useEffect, useState } from "react";

function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [calendarDate, setCalendarDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [calendarName, setCalendarName] = useState("");

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

  // Tee varaus tableltä
  const bookRoomFromTable = async (roomId, date, time, name) => {
    if (!roomId || !date || !time || !name) return;

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
  };

  // Poista varaus
  const deleteBooking = async (id) => {
    await fetch(`http://localhost:3001/api/bookings/${id}`, {
      method: "DELETE",
    });
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  // 30 minuutin aikavälit 8:00 - 18:00
  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    timeSlots.push(`${String(hour).padStart(2, "0")}:00`);
    timeSlots.push(`${String(hour).padStart(2, "0")}:30`);
  }

  const now = new Date();

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Kokoushuonevaraus</h1>

      <div style={{ marginBottom: 10 }}>
        <label>
          Valitse päivä:{" "}
          <input
            type="date"
            value={calendarDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setCalendarDate(e.target.value)}
          />
        </label>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          Varaajan nimi:{" "}
          <input
            type="text"
            placeholder="Varaajan nimi"
            value={calendarName}
            onChange={(e) => setCalendarName(e.target.value)}
          />
        </label>
      </div>

      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", width: "100%" }}
      >
        <thead>
          <tr>
            <th>Aika</th>
            {rooms.map((room) => (
              <th key={room.id}>{room.name}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {timeSlots.map((time) => {
            const slotDateTime = new Date(`${calendarDate}T${time}:00`);
            const isPast = slotDateTime < now;

            return (
              <tr key={time}>
                <td>{time}</td>
                {rooms.map((room) => {
                  const booking = bookings.find(
                    (b) =>
                      b.roomId === room.id &&
                      b.date === calendarDate &&
                      b.time === time
                  );

                  let bgColor = isPast ? "#ccc" : booking ? "#f88" : "#8f8";

                  return (
                    <td
                      key={room.id + time}
                      style={{
                        cursor:
                          !isPast && (!booking || booking) ? "pointer" : "default",
                        backgroundColor: bgColor,
                        transition: "all 0.2s",
                        textAlign: "center",
                      }}
                      onMouseEnter={(e) => {
                        if (!booking && !isPast) e.target.style.backgroundColor = "aqua";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = bgColor;
                      }}
                      onClick={() => {
                        if (booking) {
                          if (
                            window.confirm(
                              `Haluatko perua varauksen: ${booking.name}?`
                            )
                          ) {
                            deleteBooking(booking.id);
                          }
                        } else if (!isPast) {
                          if (!calendarName)
                            return alert(
                              "Täytä varaajan nimi ennen varausta!"
                            );
                          bookRoomFromTable(
                            room.id,
                            calendarDate,
                            time,
                            calendarName
                          );
                        }
                      }}
                    >
                      {booking ? booking.name : isPast ? "Mennyt" : "Vapaa"}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
