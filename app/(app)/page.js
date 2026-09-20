import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Greeting from "./greeting";

async function countRows(supabase, table, filters = {}) {
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { count } = await query;
  return count ?? 0;
}

const SOON = ["Announcements", "Projects", "Goals"];

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("admin_profiles")
      .select("username, display_name")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }
  const firstName = (profile?.display_name || profile?.username || "officer").split(" ")[0];

  const [pending, accepted, rejected, memberCount, memberPublished] = await Promise.all([
    countRows(supabase, "applications", { status: "pending" }),
    countRows(supabase, "applications", { status: "accepted" }),
    countRows(supabase, "applications", { status: "rejected" }),
    countRows(supabase, "members"),
    countRows(supabase, "members", { published: true }),
  ]);

  return (
    <div>
      <div className="page__head">
        <div>
          <p className="page__eyebrow">Overview</p>
          <Greeting name={firstName} />
        </div>
      </div>

      <div className="spread">
        <Link href="/content/members" className="feature">
          <p className="feature__eyebrow">Content</p>
          <h2 className="feature__title">Members</h2>
          <p className="feature__number">{memberCount}</p>
          <p className="feature__desc">
            on the roster &mdash; {memberPublished} published to the public site.
          </p>
          <span className="feature__link">View members &rarr;</span>
        </Link>

        <Link href="/applications" className="feature">
          <p className="feature__eyebrow">Membership</p>
          <h2 className="feature__title">Applications</h2>
          <p className="feature__number">{pending}</p>
          <p className="feature__desc">
            waiting on a decision &mdash; {accepted} accepted, {rejected} rejected all-time.
          </p>
          <span className="feature__link">Review applications &rarr;</span>
        </Link>
      </div>

      <div className="ticker">
        {SOON.map((label) => (
          <span key={label} className="ticker__item">
            {label} <b>Soon</b>
          </span>
        ))}
      </div>
    </div>
  );
}
