using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Warning billboard or evacuation map located at critical intersections.
    /// Provides student guidance and awards situational awareness scores.
    /// </summary>
    public class InteractableWarningBoard : InteractableBase
    {
        [Header("Board Details")]
        [SerializeField] private string _boardTitle = "BẢNG CẢNH BÁO THIÊN TAI";
        [TextArea(2, 4)]
        [SerializeField] private string _guidanceMessage = "CHÚ Ý: Khi có mưa lớn kéo dài, tuyệt đối không di chuyển qua ngầm tràn, suối cạn. Luôn chủ động sơ tán lên các vị trí cao điểm, tránh xa taluy đất dốc.";
        [SerializeField] private int _awarenessScore = 5;

        protected override void OnInteracted(GameObject interactor)
        {
            Debug.Log($"[{_boardTitle}] { _guidanceMessage }");

            if (ScoreManager.Instance != null && _awarenessScore > 0)
            {
                ScoreManager.Instance.Add(
                    ScoreCategory.HazardAwareness,
                    _awarenessScore,
                    $"Đọc hướng dẫn biển cảnh báo: {_boardTitle}"
                );
            }

            if (PlayerActionLog.Instance != null)
            {
                PlayerActionLog.Instance.RecordAction(
                    $"Đọc biển báo: {_boardTitle}",
                    gameObject.name,
                    _awarenessScore
                );
            }
        }
    }
}
