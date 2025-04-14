import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button } from "@/components/ui/button";
import { db } from "../../firebaseconfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/Authcontext";
import { Trash2 } from "lucide-react";

const UpdateSchedule = () => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState(new Date());
  const [availability, setAvailability] = useState<"available" | "unavailable">("available");
  const [scheduleLog, setScheduleLog] = useState<{ date: string; status: string }[]>([]);

  useEffect(() => {
    if (currentUser) {
      fetchAvailability();
    }
  }, [currentUser]);

  const fetchAvailability = async () => {
    if (!currentUser) return;

    const artistRef = doc(db, "artists", currentUser.uid);
    const docSnap = await getDoc(artistRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.availability) {
        const availabilityEntries = Object.entries(data.availability).map(([date, status]) => ({
          date,
          status: status as string,
        }));
        setScheduleLog(availabilityEntries);
      }
    }
  };

  const handleDateChange = (newDate: Date | Date[]) => {
    if (Array.isArray(newDate)) return;
    const localDate = newDate.toLocaleDateString("en-CA");
    setDate(newDate);

    const existingAvailability = scheduleLog.find((entry) => entry.date === localDate);
    setAvailability(existingAvailability ? (existingAvailability.status as "available" | "unavailable") : "available");
  };

  const handleAvailabilityChange = (status: "available" | "unavailable") => {
    setAvailability(status);
  };

  const saveAvailability = async () => {
    if (!currentUser) return;

    const localDate = date.toLocaleDateString("en-CA");
    const artistRef = doc(db, "artists", currentUser.uid);
    const docSnap = await getDoc(artistRef);

    let updatedAvailability = {};
    if (docSnap.exists()) {
      const data = docSnap.data();
      updatedAvailability = { ...data.availability, [localDate]: availability };
    } else {
      updatedAvailability = { [localDate]: availability };
    }
    await updateDoc(artistRef, {
      availability: updatedAvailability,
    });

    setScheduleLog((prev) => [
      ...prev.filter((entry) => entry.date !== localDate),
      { date: localDate, status: availability },
    ]);

    alert("Availability updated successfully!");
  };

  const handleDeleteAvailability = async (dateToDelete: string) => {
    if (!currentUser) return;

    const artistRef = doc(db, "artists", currentUser.uid);
    const docSnap = await getDoc(artistRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const updatedAvailability = { ...data.availability };
      delete updatedAvailability[dateToDelete];

      await updateDoc(artistRef, {
        availability: updatedAvailability,
      });

      setScheduleLog((prev) => prev.filter((entry) => entry.date !== dateToDelete));
      alert("Availability entry deleted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-glamour-light p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8 p-20">
        {/* Main Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-glamour-gold/20 shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="font-serif text-2xl md:text-3xl bg-gradient-to-r from-glamour-red to-glamour-gold bg-clip-text text-transparent mb-6">
            Update Your Availability
          </h2>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Calendar */}
            <div className="flex-1">
              <style jsx>{`
                .react-calendar {
                  border: none !important;
                  border-radius: 0.75rem !important;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
                  background: rgba(255, 255, 255, 0.95) !important;
                }
                .react-calendar__tile--active {
                  background: linear-gradient(to right, #f5c6a5, #e76f51) !important;
                  color: white !important;
                }
                .react-calendar__tile--active:enabled:hover,
                .react-calendar__tile--active:enabled:focus {
                  background: linear-gradient(to right, #e76f51, #f5c6a5) !important;
                }
                .react-calendar__navigation button {
                  color: #4a2c2a !important;
                  font-weight: 600 !important;
                }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                  background: rgba(245, 198, 165, 0.2) !important;
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                  background: rgba(245, 198, 165, 0.3) !important;
                }
                .react-calendar__tile {
                  color: #4a2c2a !important;
                }
              `}</style>
              <Calendar
                onChange={handleDateChange}
                value={date}
                className="rounded-lg p-4"
              />
            </div>

            {/* Availability Controls */}
            <div className="flex-1 space-y-6">
              <h3 className="font-serif text-lg md:text-xl text-glamour-dark">
                Set Availability for {date.toDateString()}
              </h3>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleAvailabilityChange("available")}
                  className={`flex-1 rounded-lg py-6 text-base font-medium transition-all ${
                    availability === "available"
                      ? "bg-gradient-to-r from-glamour-gold to-glamour-red text-white shadow-md"
                      : "bg-glamour-light/50 text-glamour-dark/70 border border-glamour-gold/20 hover:bg-glamour-gold/10"
                  }`}
                >
                  Available
                </Button>
                <Button
                  onClick={() => handleAvailabilityChange("unavailable")}
                  className={`flex-1 rounded-lg py-6 text-base font-medium transition-all ${
                    availability === "unavailable"
                      ? "bg-gradient-to-r from-glamour-red to-glamour-gold text-white shadow-md"
                      : "bg-glamour-light/50 text-glamour-dark/70 border border-glamour-gold/20 hover:bg-glamour-red/10"
                  }`}
                >
                  Unavailable
                </Button>
              </div>
              <Button
                onClick={saveAvailability}
                className="w-full bg-gradient-glamour text-white hover:opacity-90 shadow-md rounded-lg py-6 text-base font-medium"
              >
                Save Availability
              </Button>
            </div>
          </div>
        </div>

        {/* Availability Log */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-glamour-gold/20 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="font-serif text-xl md:text-2xl text-glamour-dark mb-6">
            Your Availability Schedule
          </h3>
          {scheduleLog.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {scheduleLog.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-glamour-gold/20 hover:border-glamour-red hover:shadow-md transition-all"
                >
                  <div>
                    <p className="text-glamour-dark font-medium">{entry.date}</p>
                    <p
                      className={`text-sm ${
                        entry.status === "available" ? "text-glamour-gold" : "text-glamour-red"
                      }`}
                    >
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setDate(new Date(entry.date));
                        setAvailability(entry.status as "available" | "unavailable");
                      }}
                      className="bg-gradient-glamour text-white hover:opacity-90 rounded-lg px-4 py-2"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteAvailability(entry.date)}
                      className="bg-glamour-red/20 text-glamour-red hover:bg-glamour-red/40 rounded-lg px-4 py-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-glamour-dark/70">No availability set yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateSchedule;