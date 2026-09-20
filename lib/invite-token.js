import { randomBytes, createHash } from "node:crypto";

/* Only the hash is ever stored — the raw token exists for a moment,
   in the generated link, and nowhere else. Losing the invitations
   table doesn't hand out working invite links. */
export function generateToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
