import React, { Component, ReactNode } from "react";
import FeaturedArtists from "../components/FeaturedArtists"; // Adjust the import path as needed
import Hero from "@/components/Hero";

class ErrorBoundary extends Component<{ children: ReactNode }> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again later.</h1>;
    }
    return this.props.children;
  }
}

// Example usage (wrap FeaturedArtists)
export default function App() {
  return (
    <ErrorBoundary>
      <FeaturedArtists />
      <Hero />
    </ErrorBoundary>
  );
}