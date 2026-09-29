using System;

namespace DisasterSim.Core
{
    /// <summary>
    /// Represents an individual score award or deduction transaction.
    /// </summary>
    [Serializable]
    public struct ScoreEntry
    {
        public float Timestamp;
        public ScoreCategory Category;
        public int Delta;
        public string Reason;

        public ScoreEntry(float timestamp, ScoreCategory category, int delta, string reason)
        {
            Timestamp = timestamp;
            Category = category;
            Delta = delta;
            Reason = reason;
        }

        public override string ToString()
        {
            string sign = Delta >= 0 ? "+" : "";
            return $"[{Timestamp:00.0}s] {Category}: {sign}{Delta} ({Reason})";
        }
    }

    /// <summary>
    /// Represents a recorded action or critical decision made by the player during the simulation.
    /// Used for post-simulation student review, debriefing, and teacher reporting.
    /// </summary>
    [Serializable]
    public struct ActionLogEntry
    {
        public float Timestamp;
        public string Action;
        public string Target;
        public int ScoreImpact;

        public ActionLogEntry(float timestamp, string action, string target = "", int scoreImpact = 0)
        {
            Timestamp = timestamp;
            Action = action;
            Target = target;
            ScoreImpact = scoreImpact;
        }

        public string FormatMinutesSeconds()
        {
            int minutes = (int)(Timestamp / 60f);
            int seconds = (int)(Timestamp % 60f);
            return $"{minutes:00}:{seconds:00}";
        }

        public override string ToString()
        {
            string impact = ScoreImpact != 0 ? $" (Score: {(ScoreImpact > 0 ? "+" : "")}{ScoreImpact})" : "";
            string tgt = !string.IsNullOrEmpty(Target) ? $" -> {Target}" : "";
            return $"{FormatMinutesSeconds()} {Action}{tgt}{impact}";
        }
    }
}
