"use client";

import { useRef } from "react";

const STEPS = [
  {
    label: "Tap Share",
    copy: "In Safari, tap the Share icon in the toolbar.",
    icon: (
      <svg viewBox="0 0 24 24"><path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><rect x="5" y="11" width="14" height="10" rx="2" /></svg>
    ),
  },
  {
    label: "Add to Home Screen",
    copy: "Scroll the share sheet down and tap “Add to Home Screen.”",
    icon: (
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M12 8v8M8 12h8" /></svg>
    ),
  },
  {
    label: "Tap Add",
    copy: "Confirm the name and tap “Add” — the icon lands on your home screen like a normal app.",
    icon: (
      <svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M9 12l2 2 4-4" /></svg>
    ),
  },
];

export default function GetAppSheet({ className, children }) {
  const dialogRef = useRef(null);

  return (
    <>
      <button type="button" className={className} onClick={() => dialogRef.current?.showModal()}>
        {children ?? "Get the app"}
      </button>
      <dialog ref={dialogRef} className="editor-dialog">
        <div className="editor-shell">
          <header className="editor-head">
            <div><span className="eyebrow">Add to home screen</span><h2>Get the app.</h2></div>
            <button type="button" className="icon-btn" aria-label="Close" onClick={() => dialogRef.current?.close()}>×</button>
          </header>
          <p className="get-app-lede">
            YHCIC Panel isn&rsquo;t on the App Store &mdash; add it to your iPhone&rsquo;s home screen instead. It opens full-screen, just like a real app.
          </p>
          <ol className="get-app-steps">
            {STEPS.map((step, i) => (
              <li key={step.label} className="get-app-step">
                <span className="get-app-step__num">{i + 1}</span>
                <span className="get-app-step__icon" aria-hidden="true">{step.icon}</span>
                <span className="get-app-step__copy">
                  <strong>{step.label}</strong>
                  <small>{step.copy}</small>
                </span>
              </li>
            ))}
          </ol>
          <p className="get-app-note">Works in Safari on iPhone. Other browsers don&rsquo;t support this yet.</p>
        </div>
      </dialog>
    </>
  );
}
