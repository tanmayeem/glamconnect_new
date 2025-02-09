import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Button } from "@/components/ui/button";
import { db } from "../../firebaseconfig";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/Authcontext";

const UpdateSchedule = () => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState(new Date());
  const [availability, setAvailability] = useState<"available" | "unavailable">("available");

  const handleDateChange = (newDate: Date | Date[]) => {
    if (Array.isArray(newDate)) return; 
    setDate(newDate);
  };

  const handleAvailabilityChange = (status: "available" | "unavailable") => {
    setAvailability(status);
  };

  const saveAvailability = async () => {
    if (!currentUser) return;

    const artistRef = doc(db, "artists", currentUser.uid);
    await updateDoc(artistRef, {
      availability: {
        [date.toISOString().split("T")[0]]: availability, // Save availability for the selected date
      },
    });

    alert("Availability updated successfully!");
  };

  return (
    <div className="p-8 bg-white rounded-3xl shadow-xl">
      <h2 className="text-2xl font-semibold mb-6">Update Your Availability</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <Calendar
            onChange={handleDateChange}
            value={date}
            className="rounded-lg border border-gray-200 p-2"
          />
        </div>
        <div className="flex-1">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Set Availability for {date.toDateString()}</h3>
            <div className="flex gap-4">
              <Button
                onClick={() => handleAvailabilityChange("available")}
                className={`w-full ${
                  availability === "available"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Available
              </Button>
              <Button
                onClick={() => handleAvailabilityChange("unavailable")}
                className={`w-full ${
                  availability === "unavailable"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
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
    </div>
  );
};

export default UpdateSchedule;