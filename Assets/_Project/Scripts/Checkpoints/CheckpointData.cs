using System;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Data structure representing an individual educational checkpoint.
    /// </summary>
    [Serializable]
    public class CheckpointData
    {
        [Tooltip("Unique identifier (e.g. CP0, CP1, ..., CP7)")]
        public string CheckpointId;

        [Tooltip("Short human-readable checkpoint name")]
        public string CheckpointName;

        [TextArea(2, 3)]
        [Tooltip("Pedagogical instructions and guidance for the student")]
        public string Description;

        [Tooltip("Score awarded upon completing this checkpoint")]
        public int ScoreValue = 10;

        [Tooltip("Category receiving the score points")]
        public ScoreCategory Category = ScoreCategory.HazardAwareness;

        [Tooltip("How this checkpoint is triggered")]
        public CheckpointTriggerType TriggerType = CheckpointTriggerType.VolumeTrigger;

        [Tooltip("Whether this checkpoint is mandatory to finish the simulation")]
        public bool IsMandatory = true;

        [Header("Runtime Status")]
        public bool IsCompleted = false;
        public float CompletedAtTimestamp = -1f;

        public CheckpointData(
            string id,
            string name,
            string desc,
            int score,
            ScoreCategory category,
            CheckpointTriggerType triggerType = CheckpointTriggerType.VolumeTrigger,
            bool mandatory = true)
        {
            CheckpointId = id;
            CheckpointName = name;
            Description = desc;
            ScoreValue = score;
            Category = category;
            TriggerType = triggerType;
            IsMandatory = mandatory;
            IsCompleted = false;
            CompletedAtTimestamp = -1f;
        }
    }
}
