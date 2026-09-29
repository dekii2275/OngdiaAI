using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// The ultimate destination: Safe Assembly Point (Điểm tập kết an toàn trên cao điểm).
    /// Interacting checks in the student, awards EvacuationCompletion (+15 pts), and finishes the simulation.
    /// </summary>
    public class InteractableAssemblyPoint : InteractableBase
    {
        [Header("Assembly Details")]
        [SerializeField] private string _assemblyPointName = "Điểm tập kết an toàn - Nhà văn hóa đồi cao";
        [SerializeField] private int _completionScore = 15;

        protected override void OnInteracted(GameObject interactor)
        {
            Debug.Log($"[AssemblyPoint] Student successfully checked in at: {_assemblyPointName}");

            if (ScoreManager.Instance != null && _completionScore > 0)
            {
                ScoreManager.Instance.Add(
                    ScoreCategory.EvacuationCompletion,
                    _completionScore,
                    "Có mặt đúng nơi quy định tại điểm tập kết an toàn"
                );
            }

            if (PlayerActionLog.Instance != null)
            {
                PlayerActionLog.Instance.RecordAction(
                    "Đến điểm tập kết an toàn",
                    _assemblyPointName,
                    _completionScore
                );
            }

            if (CheckpointManager.Instance != null)
            {
                CheckpointManager.Instance.CompleteCheckpoint("CP7");
            }
            else if (GameManager.Instance != null)
            {
                GameManager.Instance.CompleteGame("Bạn đã sơ tán thành công và an toàn!");
            }
        }
    }
}
