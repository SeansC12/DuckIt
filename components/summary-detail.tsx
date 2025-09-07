import { Session } from "@/lib/Session";
import FeedbackItem from "./feedback-item";

export default function SummaryDetails({ session }: { session: Session }) {
  // filter into + and - feedback and remove the + and -
  const positiveFeedback = session.summary.feedback
    .split("\n")
    .filter((i) => i.startsWith("(+)"))
    .map((i) => i.substring(3));

  const negativeFeedback = session.summary.feedback
    .split("\n")
    .filter((i) => i.startsWith("(-)"))
    .map((i) => i.substring(3));

  return (
    <div className="mt-10 space-y-8">
      <h2 className="text-2xl font-bold">{session.name}</h2>
      <p>Date: {session.date.toDateString()}</p>

      <div className="flex justify-between">
        <div>
          <h3 className="text-xl font-bold">Content Accuracy</h3>
          {/* show the feedback in bullet form */}
          <ul className="space-y-5 py-5">
            {positiveFeedback.map((element, i) => (
              <FeedbackItem key={i} correct={true} content={element} />
            ))}
            {negativeFeedback.map((element, i) => (
              <FeedbackItem key={i} correct={false} content={element} />
            ))}
          </ul>
        </div>
        <div className="w-fit">
          <h3 className="text-xl font-bold mb-5">Clarity & Confidence</h3>
          <div className="flex gap-5">
            {/* circle */}
            <div className="w-32 h-32 bg-white rounded-full text-primary-foreground flex items-center justify-center m-3">
              <p className="text-sm">
                <span className="block text-center text-3xl">
                  {session.summary.hesitations}
                </span>
                hesitations
              </p>
            </div>
            <div className="w-32 h-32 bg-white rounded-full text-primary-foreground flex items-center justify-center m-3">
              <p className="text-sm">
                <span className="block text-center text-3xl">
                  {session.summary.fillerWords}
                </span>
                filler words
              </p>
            </div>
          </div>
        </div>
      </div>
      <h3 className="text-xl font-bold">Transcript</h3>
      <p className="leading-8">
        {/* Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod */}
        {/* tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim */}
        {/* veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea */}
        {/* commodo consequat. Duis aute irure dolor in reprehenderit in voluptate */}
        {/* velit esse cillum dolore eu fugiat nulla pariatur. */}
        {session.summary.transcript}
      </p>
    </div>
  );
}
