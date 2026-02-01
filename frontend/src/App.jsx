import { useEffect, useState } from "react";

function App() {
  const [rooms, setRooms] = useState([]);
  const [calendarDate, setCalendarDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [name, setName] = useState("");
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedForDeletion, setSelectedForDeletion] = useState([]);

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

  // Tee useampi varaus kerralla
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
    setName("");
    alert("Varaukset tehty!");
  };

  // Poista useampi varaus kerralla
  const deleteSelectedBookings = async () => {
    for (const slot of selectedForDeletion) {
      const booking = bookings.find(
        b =>
          b.roomId === slot.roomId &&
          b.date === calendarDate &&
          b.time === slot.time &&
          b.name === name
      );
      if (booking) {
        await fetch(`http://localhost:3001/api/bookings/${booking.id}`, {
          method: "DELETE",
        });
        setBookings(prev => prev.filter(b => b.id !== booking.id));
      }
    }
    setSelectedForDeletion([]);
    setName("");
  };

  // 30 minuutin aikavälit 08:00-17:30
  const timeSlots = [];
  for (let hour = 8; hour < 18; hour++) {
    timeSlots.push(`${String(hour).padStart(2, "0")}:00`);
    timeSlots.push(`${String(hour).padStart(2, "0")}:30`);
  }

  const isPast = (date, time) => {
    const now = new Date();
    const slotTime = new Date(`${date}T${time}:00`);
    return slotTime < now;
  };

  const toggleSlot = (roomId, time) => {
    if (!calendarDate) return;
    const already = selectedSlots.find(
      s => s.roomId === roomId && s.time === time
    );
    if (already) {
      setSelectedSlots(prev =>
        prev.filter(s => !(s.roomId === roomId && s.time === time))
      );
    } else {
      setSelectedSlots(prev => [...prev, { roomId, time }]);
    }
  };

  const toggleForDeletion = (roomId, time) => {
    const already = selectedForDeletion.find(
      s => s.roomId === roomId && s.time === time
    );
    if (already) {
      setSelectedForDeletion(prev =>
        prev.filter(s => !(s.roomId === roomId && s.time === time))
      );
    } else {
      setSelectedForDeletion(prev => [...prev, { roomId, time }]);
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.time.localeCompare(b.time);
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>Kokoushuonevaraus</h1>

      <label>
        Varaajan nimi:{" "}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Kirjoita nimesi"
        />
      </label>

      <br /><br />

      <label>
        Päivämäärä:{" "}
        <input
          type="date"
          value={calendarDate}
          onChange={e => setCalendarDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </label>

      <br /><br />

      <button
        onClick={createBookings}
        disabled={selectedSlots.length === 0 || !name}
      >
        Varaa valitut ajat
      </button>

      <button
        onClick={deleteSelectedBookings}
        disabled={selectedForDeletion.length === 0 || !name}
        style={{ marginLeft: 10 }}
        title="Lisää oma nimesi voidaksesi poistaa varauksia" 
      >
        Poista valitut omat varaukset
      </button>

      <hr />

      <h2>Päivän varaukset ({calendarDate || "-"})</h2>
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

                const selected = selectedSlots.find(
                  s => s.roomId === room.id && s.time === time
                );

                const selectedDelete = selectedForDeletion.find(
                  s => s.roomId === room.id && s.time === time
                );

                let background = "#8f8"; // vapaa
                if (isPast(calendarDate, time)) background = "#ccc"; // mennyt
                if (booking && booking.name !== name) background = "#faa"; // muiden varaus
                if (booking && booking.name === name) background = "#f55"; // oma varaus
                if (selected) background = "#6af"; // valittu varaus
                if (selectedDelete) background = "#55f"; // valittu poisto

                return (
                  <td
                    key={room.id + time}
                    style={{
                      background,
                      cursor:
                        (!booking || booking.name === name) &&
                        !isPast(calendarDate, time)
                          ? "pointer"
                          : "default",
                      transition: "0.2s"
                    }}
                    onClick={() => {
                      if (isPast(calendarDate, time)) return;
                      if (!booking) {
                        toggleSlot(room.id, time);
                      } else if (booking.name === name) {
                        toggleForDeletion(room.id, time);
                      }
                    }}
                    onMouseOver={e => {
                      if (
                        (!booking || booking.name === name) &&
                        !isPast(calendarDate, time)
                      )
                        e.target.style.opacity = 0.7;
                    }}
                    onMouseOut={e => {
                      e.target.style.opacity = 1;
                    }}
                  >
                    {booking
                      ? booking.name === name
                        ? `${booking.name} (oma)`
                        : booking.name
                      : isPast(calendarDate, time)
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
