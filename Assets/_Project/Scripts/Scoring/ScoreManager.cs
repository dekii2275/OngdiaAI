using System;
using System.Collections.Generic;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Evaluates and tracks student performance across 5 pedagogical categories totaling 100 points.
    /// Strictly updated via clean API events rather than direct UI manipulation.
    /// </summary>
    public class ScoreManager : MonoBehaviour
    {
        public static ScoreManager Instance { get; private set; }

        public const int MAX_HAZARD_AWARENESS = 25;
        public const int MAX_ROUTE_CHOICE = 25;
        public const int MAX_REACTION_TIME = 20;
        public const int MAX_GROUP_SAFETY = 15;
        public const int MAX_EVACUATION_COMPLETION = 15;
        public const int MAX_TOTAL_SCORE = 100;

        private readonly Dictionary<ScoreCategory, int> _scores = new Dictionary<ScoreCategory, int>();
        private readonly List<ScoreEntry> _history = new List<ScoreEntry>();

        public IReadOnlyList<ScoreEntry> History => _history;

        public event Action<ScoreCategory, int, int> OnScoreChanged; // category, categoryScore, totalScore
        public event Action<ScoreEntry> OnScoreEntryAdded;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            ResetScore();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        /// <summary>
        /// Clears all accumulated points and transaction history.
        /// </summary>
        public void ResetScore()
        {
            _scores.Clear();
            _history.Clear();

            _scores[ScoreCategory.HazardAwareness] = 0;
            _scores[ScoreCategory.RouteChoice] = 0;
            _scores[ScoreCategory.ReactionTime] = 0;
            _scores[ScoreCategory.GroupSafety] = 0;
            _scores[ScoreCategory.EvacuationCompletion] = 0;
        }

        /// <summary>
        /// Retrieves the maximum allowable points for a given category.
        /// </summary>
        public static int GetMaxCategoryScore(ScoreCategory category) => category switch
        {
            ScoreCategory.HazardAwareness => MAX_HAZARD_AWARENESS,
            ScoreCategory.RouteChoice => MAX_ROUTE_CHOICE,
            ScoreCategory.ReactionTime => MAX_REACTION_TIME,
            ScoreCategory.GroupSafety => MAX_GROUP_SAFETY,
            ScoreCategory.EvacuationCompletion => MAX_EVACUATION_COMPLETION,
            _ => 0
        };

        /// <summary>
        /// Retrieves the current earned points for a given category.
        /// </summary>
        public int GetScore(ScoreCategory category)
        {
            return _scores.TryGetValue(category, out int val) ? val : 0;
        }

        /// <summary>
        /// Returns the combined overall score out of 100.
        /// </summary>
        public int GetTotalScore()
        {
            int sum = 0;
            foreach (var kvp in _scores)
            {
                sum += kvp.Value;
            }
            return Mathf.Clamp(sum, 0, MAX_TOTAL_SCORE);
        }

        /// <summary>
        /// Awards or deducts score points for a pedagogical category with a documented reason.
        /// </summary>
        public void Add(ScoreCategory category, int delta, string reason)
        {
            if (delta == 0) return;

            int current = GetScore(category);
            int max = GetMaxCategoryScore(category);
            int updated = Mathf.Clamp(current + delta, 0, max);
            int actualDelta = updated - current;

            _scores[category] = updated;

            float timestamp = ScenarioManager.Instance != null ? ScenarioManager.Instance.ElapsedTime : Time.time;
            ScoreEntry entry = new ScoreEntry(timestamp, category, actualDelta, reason);
            _history.Add(entry);

            int total = GetTotalScore();

            Debug.Log($"[ScoreManager] {category}: {(actualDelta >= 0 ? "+" : "")}{actualDelta} ({reason}) => Category: {updated}/{max}, Total: {total}/{MAX_TOTAL_SCORE}");

            OnScoreEntryAdded?.Invoke(entry);
            OnScoreChanged?.Invoke(category, updated, total);
        }
    }
}
