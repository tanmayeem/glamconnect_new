import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseconfig";
import { useAuth } from "@/context/Authcontext";
import { useToast } from "@/components/ui/use-toast";

const StarRating = ({ rating, setRating }: { rating: number; setRating: (r: number) => void; }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => setRating(star)}
          className={`cursor-pointer text-2xl ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const ReviewForm = ({ artistId, bookingId }: { artistId: string; bookingId: string; }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to leave a review.", variant: "destructive" });
      return;
    }
    if (rating < 1 || rating > 5) {
      toast({ title: "Invalid Rating", description: "Please select a rating between 1 and 5.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(db, "reviews"), {
        artistId,
        customerId: currentUser.uid,
        bookingId,  
        rating,
        reviewText,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
      setRating(0);
      setReviewText("");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({ title: "Submission Error", description: "Failed to submit your review. Please try again.", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Leave a Review</h2>
      <StarRating rating={rating} setRating={setRating} />
      <textarea
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Write your review here..."
        className="w-full p-2 border rounded"
        rows={4}
        required
      />
      <button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-2 rounded">
        Submit Review
      </button>
    </form>
  );
};

export default ReviewForm;