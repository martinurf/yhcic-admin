import Link from "next/link";
import GoalForm from "../form";

export default function NewGoalPage() {
  return (
    <div>
      <p className="page__eyebrow"><Link href="/content/goals" className="muted">&larr; Goals</Link></p>
      <h1 className="page__title" style={{ marginBottom: 24 }}>New goal</h1>
      <div className="panel" style={{ padding: 22, maxWidth: 560 }}>
        <GoalForm />
      </div>
    </div>
  );
}
