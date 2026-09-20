import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GoalForm from "../form";

export default async function EditGoalPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: goal } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!goal) notFound();

  return (
    <div>
      <p className="page__eyebrow"><Link href="/content/goals" className="muted">&larr; Goals</Link></p>
      <h1 className="page__title" style={{ marginBottom: 24 }}>Edit goal</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        <GoalForm goal={goal} />
      </div>
    </div>
  );
}
