"use client";

import { useEffect, useState } from "react";
import { useMenu } from "./menu-context";

const DISMISS_KEY = "yhcic-install-nudge-dismissed";

export default function InstallNudge() {
  const [visible, setVisible] = useState(false);
  const { setOpen } = useMenu();

  useEffect(() => {
    try {
      const standalone = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
      const dismissed = localStorage.getItem(DISMISS_KEY) === "1";
      setVisible(!standalone && !dismissed);
    } catch {
      // localStorage can throw in a locked-down browser — just skip the nudge.
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  if (!visible) return null;

  return (
    <div className="install-nudge">
      <p>Add YHCIC Panel to your home screen — opens full-screen, like a real app.</p>
      <div className="install-nudge__actions">
        <button type="button" className="install-nudge__cta" onClick={() => { setOpen(true); dismiss(); }}>
          Show me how
        </button>
        <button type="button" className="install-nudge__dismiss" aria-label="Dismiss" onClick={dismiss}>×</button>
      </div>
    </div>
  );
}
