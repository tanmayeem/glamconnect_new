import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button } from "@/components/ui/button";
import { db } from "../../firebaseconfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/Authcontext";

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
  
    const localDate = date.toLocaleDateString("en-CA"); // Format: YYYY-MM-DD
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
  

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl">
      <h2 className="text-2xl font-semibold mb-6">Update Your Availability</h2>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendar */}
        <div className="flex-1">
          <Calendar onChange={handleDateChange} value={date} className="rounded-lg border border-gray-200 p-2" />
        </div>

        {/* Availability Controls */}
        <div className="flex-1">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Set Availability for {date.toDateString()}</h3>
            <div className="flex gap-4">
              <Button
                onClick={() => handleAvailabilityChange("available")}
                className={`w-full ${
                  availability === "available" ? "bg-green-500 hover:bg-green-600" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Available
              </Button>
              <Button
                onClick={() => ("unavailable")}
                className={`w-full ${
                  availability === "unavailable" ? "bg-red-500 hover:bg-red-600" : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Unavailable
              </Button>
            </div>
            <Button onClick={saveAvailability} className="w-full bg-purple-600 hover:bg-purple-700">
              Save Availability
            </Button>
          </div>
        </div>
      </div>

      {/* Availability Log */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">Your Availability Schedule</h3>
        {scheduleLog.length > 0 ? (
          <table className="w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scheduleLog.map((entry, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="px-4 py-2">{entry.date}</td>
                  <td className={`px-4 py-2 ${entry.status === "available" ? "text-green-500" : "text-red-500"}`}>
                    {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1"
                      onClick={() => {
                        setDate(new Date(entry.date));
                        setAvailability(entry.status as "available" | "unavailable");
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600">No availability set yet.</p>
        )}
      </div>
    </div>
  );
};

export default UpdateSchedule;
