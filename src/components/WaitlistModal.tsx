import { useEffect, useRef } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onExplore: () => void;
}

/** Honest prototype dialog: no accounts, no waitlist backend, no data collected. */
export function PrototypeModal({ open, onClose, onExplore }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      <div className="modal-body">
        <p className="eyebrow">Prototype preview</p>
        <h2 id="modal-title">ROOTED isn&rsquo;t released yet.</h2>
        <p>
          This page is a front-end prototype. There&rsquo;s no app to download, no account, and no sign-up
          list &mdash; nothing you do here is saved or sent anywhere.
        </p>
        <p>You can try the real interaction now: pick up to five habits and explore the staircase.</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onExplore} autoFocus>
            Try the interactive demo
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
