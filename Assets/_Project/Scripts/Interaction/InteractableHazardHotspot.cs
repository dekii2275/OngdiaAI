using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Environmental observation hotspot (e.g. muddy water churning, cracks along hillside).
    /// Encourages students to observe natural precursor signs before catastrophic events occur (CP2).
    /// </summary>
    public class InteractableHazardHotspot : InteractableBase
    {
        [Header("Hazard Observation Data")]
        [SerializeField] private string _observationTitle = "Quan sát dòng suối đục ngầu";
        [TextArea(2, 4)]
        [SerializeField] private string _educationalFinding = "Dấu hiệu cảnh báo: Nước suối đột ngột đổi sang màu nâu đỏ đặc quánh, lẫn cây cối và có mùi bùn tanh nồng. Đây là dấu hiệu chắc chắn của lũ quét sắp ập xuống!";
        [SerializeField] private int _awarenessReward = 15;
        [SerializeField] private string _targetCheckpointId = "CP2";

        protected override void OnInteracted(GameObject interactor)
        {
            Debug.Log($"[Hazard Hotspot] {_observationTitle}: {_educationalFinding}");

            if (ScoreManager.Instance != null && _awarenessReward > 0)
            {
                ScoreManager.Instance.Add(
                    ScoreCategory.HazardAwareness,
                    _awarenessReward,
                    $"Phát hiện dấu hiệu tiền triệu chứng: {_observationTitle}"
                );
            }

            if (PlayerActionLog.Instance != null)
            {
                PlayerActionLog.Instance.RecordAction(
                    $"Quan sát hiện trường: {_observationTitle}",
                    gameObject.name,
                    _awarenessReward
                );
            }

            if (!string.IsNullOrEmpty(_targetCheckpointId) && CheckpointManager.Instance != null)
            {
                CheckpointManager.Instance.CompleteCheckpoint(_targetCheckpointId);
            }
        }
    }
}
