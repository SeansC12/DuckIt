"use client";

import { Progress } from "@/components/ui/progress";

interface DonutScoreProps {
  score: number;
  size?: number;
}

function DonutScore({ score, size = 180 }: DonutScoreProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 60) return "stroke-yellow-500";
    if (score >= 40) return "stroke-orange-500";
    return "stroke-red-500";
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="20"
          fill="transparent"
          className="text-muted-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="20"
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out ${getColor(score)}`}
        />
      </svg>
      {/* Score text in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">{score}</div>
          <div className="text-lg text-muted-foreground">/ 100</div>
        </div>
      </div>
    </div>
  );
}

interface ScoreDashboardProps {
  donutScore: number;
  accuracyScore: number;
  familiarityScore: number;
  clarityScore: number;
}

export function ScoreDashboard({
  donutScore,
  accuracyScore,
  familiarityScore,
  clarityScore,
}: ScoreDashboardProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* First column - Donut Score (smaller width) */}
      <div className="flex flex-col items-center justify-center min-w-80 p-6 rounded-lg border gap-5">
        <h2>Overall Score</h2>
        <DonutScore score={donutScore} />
      </div>

      <div className="flex flex-1 gap-6 p-6 rounded-lg border flex-col lg:flex-row">
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Accuracy</h3>
          <div className="space-y-2">
            <Progress value={accuracyScore} className="h-2" />
            <div className="text-sm text-muted-foreground text-right">
              {accuracyScore}%
            </div>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">
            This measures whether the facts, details, and reasoning in your
            explanation are correct. High accuracy means you got the details
            right and didn&apos;t include major mistakes.
          </p>
        </div>

        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Familiarity</h3>
          <div className="space-y-2">
            <Progress value={familiarityScore} className="h-2" />
            <div className="text-sm text-muted-foreground text-right">
              {familiarityScore}%
            </div>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">
            This looks at whether you explain smoothly without too many pauses,
            hesitations, or guesses. High familiarity means you really know the
            material and can recall it easily.
          </p>
        </div>

        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Clarity</h3>
          <div className="space-y-2">
            <Progress value={clarityScore} className="h-2" />
            <div className="text-sm text-muted-foreground text-right">
              {clarityScore}%
            </div>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">
            This checks if your explanation is organised, logical, and clear.
            High clarity means someone else could easily follow what you said
            without confusion.
          </p>
        </div>
      </div>
    </div>
  );
}
