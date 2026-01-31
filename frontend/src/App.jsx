import { useEffect, useState } from "react";

function App() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [calendarDate, setCalendarDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [name, setName] = useState("");

  const [selectedSlots, setSelectedSlots] = useState([]);

  // ================= DATA =================

  useEffect(() => {
    fetch("http://localhost:3001/api/rooms")
      .then(res => res.json())
      .then(setRooms);

    fetch("http://localhost:3001/api/bookings")
      .then(res => res.json())
      .then(setBookings);
  }, []);

  // ================= TIME SLOTS =================

  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    timeSlots.push(`${String(hour).padStart(2, "0")}:00`);
    timeSlots.push(`${String(hour).padStart(2, "0")}:30`);
  }

  const now = new Date();

  // ================= HELPERS =================

  const toggleSlot = (roomId, time) => {
    setSelectedSlots(prev => {
      const exists = prev.find(
        s => s.roomId === roomId && s.time === time
      );

      if (exists) {
        return prev.filter(
          s => !(s.roomId === roomId && s.time === time)
        );
      }

      return [...prev, { roomId, time }];
    });
  };

  // ================= ACTIONS =================

  const createBookings = async () => {
    if (!name || selectedSlots.length === 0) {
      alert("Täytä nimi ja valitse vähintään yksi aika");
      return;
    }

    for (const slot of selectedSlots) {
      const response = await fetch("http://localhost:3001/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: slot.roomId,
          date: calendarDate,
          time: slot.time,
          name
        })
      });

      if (response.status === 409) {
        const data = await response.json();
        alert(data.message);
        return;
      }

      const newBooking = await response.json();
      setBookings(prev => [...prev, newBooking]);
    }

    setSelectedSlots([]);
    alert("Varaukset tehty!");
  };

  const deleteBooking = async (id) => {
    await fetch(`http://localhost:3001/api/bookings/${id}`, {
      method: "DELETE",
    });
    setBookings(prev => prev.filter(b => b.id !== id));
  };

  // ================= UI =================

  return (
    <div style={{ padding: 20 }}>
      <h1>Kokoushuonevaraus</h1>

      <div style={{ marginBottom: 10 }}>
        <strong>Päivä: </strong>
        <input
          type="date"
          min={new Date().toISOString().split("T")[0]}
          value={calendarDate}
          onChange={e => {
            setCalendarDate(e.target.value);
            setSelectedSlots([]);
          }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <strong>Varaajan nimi: </strong>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Kirjoita nimi"
        />
      </div>

      <button
        onClick={createBookings}
        disabled={selectedSlots.length === 0 || !name}
        style={{ marginBottom: 10 }}
      >
        Varaa aika/ajat
      </button>


      <h2>
        Päivän varaukset ({calendarDate.split("-").reverse().join(".")})
      </h2>

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
                    b.date === calendarDate &&
                    b.time === time
                );

                const slotDateTime = new Date(`${calendarDate}T${time}:00`);
                const isPast = slotDateTime < now;

                const isSelected = selectedSlots.some(
                  s => s.roomId === room.id && s.time === time
                );

                let background = "#8f8"; // vapaa
                if (isPast) background = "#ccc";
                if (booking) background = "#f88";
                if (isSelected) background = "#6af";

                return (
                  <td
                    key={room.id + time}
                    style={{
                      backgroundColor: background,
                      cursor: isPast ? "default" : "pointer",
                      textAlign: "center",
                      transition: "0.2s"
                    }}
                    onClick={() => {
                      if (isPast) return;

                      if (booking) {
                        if (
                          window.confirm(
                            `Perutaanko varaus (${booking.name})?`
                          )
                        ) {
                          deleteBooking(booking.id);
                        }
                      } else {
                        toggleSlot(room.id, time);
                      }
                    }}
                    onMouseEnter={e => {
                      if (!booking && !isPast)
                        e.target.style.opacity = 0.8;
                    }}
                    onMouseLeave={e => {
                      e.target.style.opacity = 1;
                    }}
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
