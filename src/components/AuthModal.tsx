import { useEffect, useRef, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<boolean>;
}

type Status = "idle" | "sending" | "sent" | "error";

/** Passwordless sign-in: asks for an email and sends a one-time magic link. */
export function AuthModal({ open, onClose, onSubmit }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => {
    setStatus("idle");
    onClose();
  };

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="auth-title"
      onClose={close}
      onClick={(e) => e.target === ref.current && close()}
    >
      <div className="modal-body">
        <p className="eyebrow">Save your journey</p>
        <h2 id="auth-title">Sign in with a magic link.</h2>
        {status === "sent" ? (
          <>
            <p role="status">
              If that address can receive email, a sign-in link is on its way. Open it on this device to
              continue. You can close this window.
            </p>
            <div className="modal-actions">
              <button type="button" className="btn btn-primary" onClick={close} autoFocus>
                Done
              </button>
            </div>
          </>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setStatus("sending");
              setStatus((await onSubmit(email.trim())) ? "sent" : "error");
            }}
          >
            <p>
              No password. We email you a one-time link, and your habits and check-ins are saved to your
              account.
            </p>
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            {status === "error" && (
              <p className="form-error" role="alert">
                We couldn&rsquo;t send the link. Check the address and try again in a moment.
              </p>
            )}
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={status === "sending" || !email.trim()}>
                {status === "sending" ? "Sending…" : "Email me a link"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={close}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
