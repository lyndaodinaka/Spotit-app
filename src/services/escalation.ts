export function calculateEscalation(input: {
  previousAreaCm2?: number;
  currentAreaCm2?: number;
  previousPainScore?: number;
  currentPainScore?: number;
  exudateAmount?: string;
  exudateType?: string;
  infectionSigns?: string;
}) {
  const flags: string[] = [];
  const areaChange =
    input.previousAreaCm2 && input.currentAreaCm2
      ? ((input.currentAreaCm2 - input.previousAreaCm2) / input.previousAreaCm2) * 100
      : 0;

  const painChange =
    typeof input.currentPainScore === "number" && typeof input.previousPainScore === "number"
      ? input.currentPainScore - input.previousPainScore
      : 0;

  if (areaChange >= 20) flags.push("Wound area increased by more than 20%");
  if (painChange >= 2) flags.push("New or worsening pain");
  if (input.exudateAmount === "High") flags.push("Increased exudate");
  if (input.exudateType === "Purulent" || input.exudateType === "Pseudomonas") flags.push("Concerning exudate type");
  if (input.infectionSigns && input.infectionSigns !== "None recorded") flags.push("Infection or inflammation signs recorded");

  return {
    required: flags.length > 0,
    flags
  };
}
