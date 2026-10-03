import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Hotel,
  Plane,
  Search,
  TrainFront,
  Bus,
  Map,
} from "lucide-react";
import "./ServicePages.css";

const stays = [
  [
    "The Westin Hyderabad",
    "Gachibowli",
    "₹8,499",
    "4.6",
    "Breakfast, pool, Wi-Fi",
  ],
  [
    "Oakwood Residence",
    "HITEC City",
    "₹6,200",
    "4.5",
    "Kitchenette, gym, parking",
  ],
  [
    "Taj Deccan",
    "Banjara Hills",
    "₹7,800",
    "4.7",
    "Breakfast, spa, free cancellation",
  ],
  [
    "Sree Kanya Comforts",
    "Madhapur",
    "₹2,400",
    "4.1",
    "AC room, Wi-Fi, breakfast",
  ],
] as const;

const flights = [
  [
    "6E 6231",
    "Hyderabad (HYD)",
    "Delhi (DEL)",
    "06:10 - 08:25",
    "₹5,490",
  ],
  [
    "AI 542",
    "Hyderabad (HYD)",
    "Delhi (DEL)",
    "11:20 - 13:40",
    "₹6,120",
  ],
  [
    "UK 890",
    "Hyderabad (HYD)",
    "Delhi (DEL)",
    "19:15 - 21:35",
    "₹5,890",
  ],
] as const;

/* ---------------- TRAIN DEMO DATA ---------------- */

const trains = [
  [
    "12723",
    "Telangana Express",
    "Hyderabad (HYB)",
    "Delhi (NDLS)",
    "06:25 - 07:10",
    "₹1,850",
    "Sleeper / 3A",
  ],
  [
    "12701",
    "Hussain Sagar Express",
    "Hyderabad (HYB)",
    "Mumbai (CSMT)",
    "16:45 - 09:15",
    "₹1,420",
    "Sleeper / 3A",
  ],
  [
    "17015",
    "Visakha Express",
    "Hyderabad (SC)",
    "Visakhapatnam (VSKP)",
    "17:20 - 07:30",
    "₹980",
    "Sleeper / 3A",
  ],
] as const;

/* ---------------- BUS DEMO DATA ---------------- */

const buses = [
  [
    "TSRTC",
    "Super Luxury",
    "Hyderabad",
    "Warangal",
    "07:00 - 10:15",
    "₹320",
    "AC",
  ],
  [
    "Orange Travels",
    "Volvo Multi-Axle",
    "Hyderabad",
    "Bengaluru",
    "21:30 - 06:30",
    "₹1,150",
    "AC Sleeper",
  ],
  [
    "IntrCity SmartBus",
    "SmartBus",
    "Hyderabad",
    "Vijayawada",
    "22:00 - 05:30",
    "₹780",
    "AC Sleeper",
  ],
  [
    "Morning Star",
    "Executive Coach",
    "Hyderabad",
    "Chennai",
    "20:45 - 07:00",
    "₹1,050",
    "AC Seater",
  ],
] as const;

/* ---------------- HOLIDAY DEMO DATA ---------------- */

const holidayPackages = [
  [
    "Goa Beach Escape",
    "Goa",
    "3 Nights / 4 Days",
    "₹18,999",
    "Hotels, breakfast, sightseeing",
  ],
  [
    "Kerala Backwaters",
    "Kerala",
    "4 Nights / 5 Days",
    "₹24,500",
    "Hotel, houseboat, breakfast",
  ],
  [
    "Rajasthan Heritage Tour",
    "Jaipur • Jodhpur • Udaipur",
    "5 Nights / 6 Days",
    "₹32,999",
    "Hotels, transfers, sightseeing",
  ],
  [
    "Manali Mountain Escape",
    "Manali",
    "4 Nights / 5 Days",
    "₹21,999",
    "Hotel, transfers, sightseeing",
  ],
] as const;

const modes = [
  "Flights",
  "Trains",
  "Bus",
  "Hotels",
  "Holiday packages",
];

export default function TravelPage() {
  const [mode, setMode] = useState("Hotels");
  const [message, setMessage] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);

  const [flightSearch, setFlightSearch] = useState({
    from: "Hyderabad (HYD)",
    to: "Delhi (DEL)",
    date: "",
  });

  const [hotelForm, setHotelForm] = useState({
    name: "",
    phone: "",
    checkIn: "",
    checkOut: "",
    governmentId: "",
    room: "AC room",
  });

  const showFlights = mode === "Flights";
  const showHotels = mode === "Hotels";
  const showTrains = mode === "Trains";
  const showBus = mode === "Bus";
  const showHolidayPackages = mode === "Holiday packages";

  const handleSearch = () => {
    setMessage(
      `${mode} search updated for ${flightSearch.from} to ${flightSearch.to}.`,
    );
  };

  return (
    <main className="service-page">
      {/* HERO */}
      <section className="service-hero service-hero--travel">
        <div>
          <span className="eyebrow">OneHub Travel & Stay</span>

          <h1>Make the next trip easy.</h1>

          <p>
            Compare flights, trains, buses, hotels and holiday packages
            from one place.
          </p>
        </div>

        <div className="travel-icons">
          <Plane />
          <TrainFront />
          <Hotel />
        </div>
      </section>

      {/* SEARCH PANEL */}
      <div className="travel-panel">
        <div className="chip-row">
          {modes.map((item) => (
            <button
              key={item}
              type="button"
              className={
                mode === item
                  ? "chip chip--active"
                  : "chip"
              }
              onClick={() => {
                setMode(item);
                setMessage("");
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {/* SEARCH FIELDS ARE HIDDEN ONLY FOR HOTELS */}
        {!showHotels && (
          <div className="travel-fields">
            <label>
              <span>From</span>

              <input
                list="airports"
                value={flightSearch.from}
                onChange={(event) =>
                  setFlightSearch({
                    ...flightSearch,
                    from: event.target.value,
                  })
                }
                placeholder="Hyderabad airport"
              />
            </label>

            <label>
              <span>To</span>

              <input
                list="airports"
                value={flightSearch.to}
                onChange={(event) =>
                  setFlightSearch({
                    ...flightSearch,
                    to: event.target.value,
                  })
                }
                placeholder="Destination"
              />
            </label>

            <datalist id="airports">
              <option value="Rajiv Gandhi International Airport, Hyderabad (HYD)" />
              <option value="Indira Gandhi International Airport, Delhi (DEL)" />
              <option value="Kempegowda International Airport, Bengaluru (BLR)" />
            </datalist>

            <label>
              <span>Date</span>

              <input
                type="date"
                value={flightSearch.date}
                onChange={(event) =>
                  setFlightSearch({
                    ...flightSearch,
                    date: event.target.value,
                  })
                }
              />
            </label>

            <button
              type="button"
              className="primary-button"
              onClick={handleSearch}
            >
              <Search size={17} />
              Search
            </button>
          </div>
        )}
      </div>

      {/* ---------------- FLIGHTS ---------------- */}

      {showFlights && (
        <>
          <section className="section-heading">
            <div>
              <span className="eyebrow">Available routes</span>

              <h2>
                Flights from Hyderabad to Delhi
              </h2>
            </div>

            <span>{flights.length} options</span>
          </section>

          <div className="catalog-grid">
            {flights.map(
              ([number, from, to, time, price]) => (
                <article
                  className="catalog-card"
                  key={number}
                >
                  <div className="stay-art">
                    <Plane size={32} />
                  </div>

                  <div className="catalog-card__body">
                    <h3>{number}</h3>

                    <p>
                      {from} → {to}
                    </p>

                    <strong>{time}</strong>

                    <small>
                      {price} • Economy • 7 kg cabin bag
                    </small>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        setMessage(
                          `${number} selected for your trip.`,
                        )
                      }
                    >
                      Select flight
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        </>
      )}

      {/* ---------------- TRAINS ---------------- */}

      {showTrains && (
        <>
          <section className="section-heading">
            <div>
              <span className="eyebrow">Available trains</span>

              <h2>
                Trains from Hyderabad
              </h2>
            </div>

            <span>{trains.length} options</span>
          </section>

          <div className="catalog-grid">
            {trains.map(
              ([
                number,
                name,
                from,
                to,
                time,
                price,
                classType,
              ]) => (
                <article
                  className="catalog-card"
                  key={number}
                >
                  <div className="stay-art">
                    <TrainFront size={32} />
                  </div>

                  <div className="catalog-card__body">
                    <h3>{name}</h3>

                    <p>
                      {number} • {from} → {to}
                    </p>

                    <strong>{time}</strong>

                    <small>
                      {price} • {classType}
                    </small>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        setMessage(
                          `${name} selected for your trip.`,
                        )
                      }
                    >
                      Select train
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        </>
      )}

      {/* ---------------- BUS ---------------- */}

      {showBus && (
        <>
          <section className="section-heading">
            <div>
              <span className="eyebrow">Available buses</span>

              <h2>
                Bus services from Hyderabad
              </h2>
            </div>

            <span>{buses.length} options</span>
          </section>

          <div className="catalog-grid">
            {buses.map(
              ([
                operator,
                busName,
                from,
                to,
                time,
                price,
                busType,
              ]) => (
                <article
                  className="catalog-card"
                  key={`${operator}-${busName}`}
                >
                  <div className="stay-art">
                    <Bus size={32} />
                  </div>

                  <div className="catalog-card__body">
                    <h3>{operator}</h3>

                    <p>
                      {busName} • {from} → {to}
                    </p>

                    <strong>{time}</strong>

                    <small>
                      {price} • {busType}
                    </small>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        setMessage(
                          `${operator} ${busName} selected for your trip.`,
                        )
                      }
                    >
                      Select bus
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        </>
      )}

      {/* ---------------- HOLIDAY PACKAGES ---------------- */}

      {showHolidayPackages && (
        <>
          <section className="section-heading">
            <div>
              <span className="eyebrow">
                Handpicked holidays
              </span>

              <h2>
                Popular holiday packages
              </h2>
            </div>

            <span>
              {holidayPackages.length} packages
            </span>
          </section>

          <div className="catalog-grid">
            {holidayPackages.map(
              ([
                name,
                location,
                duration,
                price,
                details,
              ]) => (
                <article
                  className="catalog-card stay-card"
                  key={name}
                >
                  <div className="stay-art">
                    <Map size={30} />
                  </div>

                  <div className="catalog-card__body">
                    <div className="card-title">
                      <h3>{name}</h3>
                    </div>

                    <p>{location}</p>

                    <strong>{price}</strong>

                    <small>
                      {duration} • {details}
                    </small>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        setMessage(
                          `${name} package selected.`,
                        )
                      }
                    >
                      View package
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        </>
      )}

      {/* ---------------- HOTELS ---------------- */}

      {showHotels && (
        <>
          <section className="section-heading">
            <div>
              <span className="eyebrow">
                Handpicked for you
              </span>

              <h2>
                Popular stays in Hyderabad
              </h2>
            </div>

            <span>
              <CalendarDays size={16} />
              Flexible booking
            </span>
          </section>

          <div className="catalog-grid">
            {stays.map(
              ([
                name,
                location,
                price,
                rating,
                detail,
              ]) => (
                <article
                  className="catalog-card stay-card"
                  key={name}
                >
                  <div className="stay-art">
                    <Hotel size={30} />
                  </div>

                  <div className="catalog-card__body">
                    <div className="card-title">
                      <h3>{name}</h3>

                      <span className="rating">
                        {rating}
                      </span>
                    </div>

                    <p>{location}</p>

                    <strong>
                      {price} <small>/ night</small>
                    </strong>

                    <small>{detail}</small>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        setSelectedHotel(name)
                      }
                    >
                      View rooms
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        </>
      )}

      {/* HOTEL BOOKING DIALOG */}

      {selectedHotel && (
        <div className="dialog-backdrop">
          <section className="dialog-card dialog-card--wide">
            <span className="eyebrow">
              {selectedHotel}
            </span>

            <h2>Choose your stay</h2>

            <p>
              Breakfast, Wi-Fi, verified rooms and
              24-hour guest support included.
            </p>

            <div className="room-options">
              {[
                "Normal room",
                "AC room",
                "Suite room",
              ].map((room) => (
                <button
                  type="button"
                  key={room}
                  className={
                    hotelForm.room === room
                      ? "chip chip--active"
                      : "chip"
                  }
                  onClick={() =>
                    setHotelForm({
                      ...hotelForm,
                      room,
                    })
                  }
                >
                  {room}
                </button>
              ))}
            </div>

            <div className="travel-fields">
              <input
                placeholder="Full name"
                value={hotelForm.name}
                onChange={(event) =>
                  setHotelForm({
                    ...hotelForm,
                    name: event.target.value,
                  })
                }
              />

              <input
                placeholder="Contact number"
                value={hotelForm.phone}
                onChange={(event) =>
                  setHotelForm({
                    ...hotelForm,
                    phone: event.target.value,
                  })
                }
              />

              <input
                type="datetime-local"
                value={hotelForm.checkIn}
                onChange={(event) =>
                  setHotelForm({
                    ...hotelForm,
                    checkIn: event.target.value,
                  })
                }
              />

              <input
                type="datetime-local"
                value={hotelForm.checkOut}
                onChange={(event) =>
                  setHotelForm({
                    ...hotelForm,
                    checkOut: event.target.value,
                  })
                }
              />

              <input
                placeholder="Government ID number for check-in verification"
                value={hotelForm.governmentId}
                onChange={(event) =>
                  setHotelForm({
                    ...hotelForm,
                    governmentId: event.target.value,
                  })
                }
              />
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setSelectedHotel(null);

                setMessage(
                  `Booking confirmed. Your hotel booking ID is OH-HOTEL-${Date.now()
                    .toString()
                    .slice(-6)}. Support: +91 90000 11122.`,
                );
              }}
            >
              <CheckCircle2 size={16} />
              Confirm room booking
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setSelectedHotel(null)
              }
            >
              Cancel
            </button>
          </section>
        </div>
      )}

      {/* TOAST */}

      {message && (
        <div
          className="toast"
          role="status"
        >
          {message}
        </div>
      )}
    </main>
  );
}