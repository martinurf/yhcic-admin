"use client";

import { useEffect, useState } from "react";

function greetingFor(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/* Client-only: the server's clock isn't the viewer's clock. Renders
   a neutral "Welcome" on first paint (matches the server) and swaps
   to the real time-of-day greeting right after mount. */
export default function Greeting({ name, className }) {
  const [text, setText] = useState("Welcome");

  useEffect(() => {
    setText(greetingFor(new Date().getHours()));
  }, []);

  return (
    <h1 className={className}>
      {text},<br />
      {name}
    </h1>
  );
}
