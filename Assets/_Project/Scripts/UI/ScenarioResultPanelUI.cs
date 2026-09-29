using UnityEngine;
using UnityEngine.UI;
using TMPro;
using DisasterSim.Core;
using DisasterSim.Gameplay;

namespace DisasterSim.UI
{
    /// <summary>
    /// Displays comprehensive simulation evaluation results upon completion or failure.
    /// Provides pedagogical score breakdown across all 5 competencies and action log debriefing.
    /// </summary>
    public class ScenarioResultPanelUI : MonoBehaviour
    {
        [Header("Panel Root")]
        [SerializeField] private GameObject _panelRoot;

        [Header("Outcome Texts")]
        [SerializeField] private TextMeshProUGUI _outcomeTitleText;
        [SerializeField] private TextMeshProUGUI _outcomeSummaryText;
        [SerializeField] private TextMeshProUGUI _totalScoreText;
        [SerializeField] private TextMeshProUGUI _gradeEvaluationText;

        [Header("Category Breakdown Texts")]
        [SerializeField] private TextMeshProUGUI _hazardAwarenessText;
        [SerializeField] private TextMeshProUGUI _routeChoiceText;
        [SerializeField] private TextMeshProUGUI _reactionTimeText;
        [SerializeField] private TextMeshProUGUI _groupSafetyText;
        [SerializeField] private TextMeshProUGUI _completionText;

        [Header("Action Log Display")]
        [SerializeField] private TextMeshProUGUI _actionLogSummaryText;

        [Header("Action Buttons")]
        [SerializeField] private Button _restartButton;

        private void Start()
        {
            if (_panelRoot != null)
            {
                _panelRoot.SetActive(false);
            }

            if (_restartButton != null)
            {
                _restartButton.onClick.AddListener(HandleRestartClicked);
            }

            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameCompleted += HandleGameCompleted;
                GameManager.Instance.OnGameFailed += HandleGameFailed;
            }
        }

        private void OnDestroy()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameCompleted -= HandleGameCompleted;
                GameManager.Instance.OnGameFailed -= HandleGameFailed;
            }
        }

        private void HandleGameCompleted(string summary)
        {
            ShowResults(true, "HOÀN THÀNH XUẤT SẮC ĐỢT SƠ TÁN", summary);
        }

        private void HandleGameFailed(string reason)
        {
            ShowResults(false, "SƠ TÁN THẤT BẠI - GẶP NGUY HIỂM", reason);
        }

        public void ShowResults(bool isSuccess, string title, string message)
        {
            if (_panelRoot != null)
            {
                _panelRoot.SetActive(true);
            }

            if (_outcomeTitleText != null)
            {
                _outcomeTitleText.text = title;
                _outcomeTitleText.color = isSuccess ? new Color(0.2f, 0.85f, 0.3f) : new Color(0.9f, 0.2f, 0.2f);
            }

            if (_outcomeSummaryText != null)
            {
                _outcomeSummaryText.text = message;
            }

            int totalScore = 0;
            if (ScoreManager.Instance != null)
            {
                int ha = ScoreManager.Instance.GetScore(ScoreCategory.HazardAwareness);
                int rc = ScoreManager.Instance.GetScore(ScoreCategory.RouteChoice);
                int rt = ScoreManager.Instance.GetScore(ScoreCategory.ReactionTime);
                int gs = ScoreManager.Instance.GetScore(ScoreCategory.GroupSafety);
                int ec = ScoreManager.Instance.GetScore(ScoreCategory.EvacuationCompletion);
                totalScore = ScoreManager.Instance.GetTotalScore();

                if (_hazardAwarenessText != null) _hazardAwarenessText.text = $"• Nhận biết nguy cơ: {ha} / 25 điểm";
                if (_routeChoiceText != null) _routeChoiceText.text = $"• Lựa chọn tuyến đường: {rc} / 25 điểm";
                if (_reactionTimeText != null) _reactionTimeText.text = $"• Thời gian phản ứng: {rt} / 20 điểm";
                if (_groupSafetyText != null) _groupSafetyText.text = $"• An toàn tập thể: {gs} / 15 điểm";
                if (_completionText != null) _completionText.text = $"• Hoàn thành sơ tán: {ec} / 15 điểm";

                if (_totalScoreText != null) _totalScoreText.text = $"TỔNG ĐIỂM: {totalScore} / 100 ĐIỂM";

                if (_gradeEvaluationText != null)
                {
                    if (totalScore >= 85)
                        _gradeEvaluationText.text = "Đánh giá: Xuất sắc - Em đã nắm vững kỹ năng phòng chống lũ quét và sạt lở đất!";
                    else if (totalScore >= 60)
                        _gradeEvaluationText.text = "Đánh giá: Khá - Em đã đến nơi an toàn, nhưng cần chú ý nhận biết sớm các dấu hiệu thiên tai hơn.";
                    else
                        _gradeEvaluationText.text = "Đánh giá: Cần luyện tập thêm - Hãy chú ý nghe hiệu lệnh báo động và tránh xa các vị trí trũng thấp, sườn dốc nứt.";
                }
            }

            if (_actionLogSummaryText != null && PlayerActionLog.Instance != null)
            {
                _actionLogSummaryText.text = PlayerActionLog.Instance.GenerateTeacherReport("Học sinh diễn tập", totalScore);
            }
        }

        private void HandleRestartClicked()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.RestartSimulation();
            }
        }
    }
}
