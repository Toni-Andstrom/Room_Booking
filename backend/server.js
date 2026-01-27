const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Esimerkkihuoneet
let rooms = [
  { id: 1, name: "Neuvotteluhuone A" },
  { id: 2, name: "Neuvotteluhuone B" },
  { id: 3, name: "Neuvotteluhuone C" },
  { id: 4, name: "Neuvotteluhuone D" },
  { id: 5, name: "Neuvotteluhuone E" },
  { id: 6, name: "Neuvotteluhuone F" },
];

// Varaukset
let bookings = [];

// =================== API ===================

// Hae huoneet
app.get("/api/rooms", (req, res) => {
  res.json(rooms);
});

// Hae kaikki varaukset
app.get("/api/bookings", (req, res) => {
  res.json(bookings);
});

// =================== Apufunktiot ===================

// Tarkistaa päällekkäisyydet 30 minuutin varauksille
function isOverlapping(existing, newBooking) {
  if (existing.roomId != newBooking.roomId || existing.date !== newBooking.date)
    return false;

  // Varauksen kesto 30 min
  const [h1, m1] = existing.time.split(":").map(Number);
  const startExisting = h1 * 60 + m1;
  const endExisting = startExisting + 30;

  const [h2, m2] = newBooking.time.split(":").map(Number);
  const startNew = h2 * 60 + m2;
  const endNew = startNew + 30;

  // Tarkistetaan, osuvatko aikavälit päällekkäin
  return startNew < endExisting && endNew > startExisting;
}

// =================== Varausten hallinta ===================

// Tee varaus
app.post("/api/bookings", (req, res) => {
  const { roomId, date, time } = req.body;

  if (!roomId || !date || !time) {
    return res.status(400).json({ message: "Täytä kaikki kentät!" });
  }

  const newBooking = { roomId, date, time };

  // Tarkista päällekkäisyydet
  const overlapping = bookings.find(b => isOverlapping(b, newBooking));
  if (overlapping) {
    return res
      .status(409)
      .json({ message: "Huone on jo varattu tälle aikavälille!" });
  }

  // Lisää varaus
  const booking = { ...newBooking, id: Date.now() };
  bookings.push(booking);

  res.status(201).json(booking);
});

// Poista varaus ID:n perusteella
app.delete("/api/bookings/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = bookings.findIndex(b => b.id === id);

  if (index !== -1) {
    const deleted = bookings.splice(index, 1)[0];
    res.json({ message: "Varaus poistettu", deleted });
  } else {
    res.status(404).json({ message: "Varausta ei löytynyt" });
  }
});

// =================== Käynnistys ===================

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API käynnissä portissa ${PORT}`);
});


