using System;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using DisasterSim.Core;
using DisasterSim.Gameplay;

namespace DisasterSim.UI
{
    /// <summary>
    /// Coordinates HUD elements: scenario title, countdown/elapsed timer, active checkpoint,
    /// dynamic route status indicators, and score tally.
    /// </summary>
    public class HUDController : MonoBehaviour
    {
        [Header("Header Elements")]
        [SerializeField] private TextMeshProUGUI _scenarioTitleText;
        [SerializeField] private TextMeshProUGUI _timerText;
        [SerializeField] private TextMeshProUGUI _scoreText;

        [Header("Objective & Checkpoint")]
        [SerializeField] private TextMeshProUGUI _objectiveTitleText;
        [SerializeField] private TextMeshProUGUI _objectiveDescText;

        [Header("Route Status Badges")]
        [SerializeField] private TextMeshProUGUI _routeAText;
        [SerializeField] private TextMeshProUGUI _routeBText;
        [SerializeField] private TextMeshProUGUI _routeCText;

        [Header("Hazard Warning Banner")]
        [SerializeField] private GameObject _hazardBannerRoot;
        [SerializeField] private TextMeshProUGUI _hazardBannerText;

        private void Start()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.OnScenarioLoaded += UpdateScenarioInfo;
                ScenarioManager.Instance.OnTimeUpdated += UpdateTimer;
                ScenarioManager.Instance.OnScenarioEventTriggered += HandleScenarioEvent;

                if (ScenarioManager.Instance.ActiveScenario != null)
                {
                    UpdateScenarioInfo(ScenarioManager.Instance.ActiveScenario);
                }
            }

            if (CheckpointManager.Instance != null)
            {
                CheckpointManager.Instance.OnActiveCheckpointChanged += UpdateCheckpointInfo;
                if (CheckpointManager.Instance.CurrentActiveCheckpoint != null)
                {
                    UpdateCheckpointInfo(CheckpointManager.Instance.CurrentActiveCheckpoint);
                }
            }

            if (RouteManager.Instance != null)
            {
                RouteManager.Instance.OnRouteStateChanged += HandleRouteStateChanged;
                RefreshAllRouteBadges();
            }

            if (ScoreManager.Instance != null)
            {
                ScoreManager.Instance.OnScoreChanged += HandleScoreChanged;
                UpdateScoreDisplay(ScoreManager.Instance.GetTotalScore());
            }
        }

        private void OnDestroy()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.OnScenarioLoaded -= UpdateScenarioInfo;
                ScenarioManager.Instance.OnTimeUpdated -= UpdateTimer;
                ScenarioManager.Instance.OnScenarioEventTriggered -= HandleScenarioEvent;
            }

            if (CheckpointManager.Instance != null)
            {
                CheckpointManager.Instance.OnActiveCheckpointChanged -= UpdateCheckpointInfo;
            }

            if (RouteManager.Instance != null)
            {
                RouteManager.Instance.OnRouteStateChanged -= HandleRouteStateChanged;
            }

            if (ScoreManager.Instance != null)
            {
                ScoreManager.Instance.OnScoreChanged -= HandleScoreChanged;
            }
        }

        private void UpdateScenarioInfo(ScenarioData data)
        {
            if (data == null) return;
            if (_scenarioTitleText != null) _scenarioTitleText.text = data.DisplayName;
        }

        private void UpdateTimer(float elapsedSeconds)
        {
            if (_timerText == null) return;
            int minutes = (int)(elapsedSeconds / 60f);
            int seconds = (int)(elapsedSeconds % 60f);
            _timerText.text = $"Thời gian: {minutes:00}:{seconds:00}";
        }

        private void UpdateScoreDisplay(int totalScore)
        {
            if (_scoreText != null)
            {
                _scoreText.text = $"Điểm: {totalScore}/100";
            }
        }

        private void HandleScoreChanged(ScoreCategory category, int categoryScore, int totalScore)
        {
            UpdateScoreDisplay(totalScore);
        }

        private void UpdateCheckpointInfo(CheckpointData cp)
        {
            if (cp != null)
            {
                if (_objectiveTitleText != null) _objectiveTitleText.text = $"Mục tiêu: {cp.CheckpointName} ({cp.CheckpointId})";
                if (_objectiveDescText != null) _objectiveDescText.text = cp.Description;
            }
            else
            {
                if (_objectiveTitleText != null) _objectiveTitleText.text = "Hoàn thành toàn bộ mục tiêu!";
                if (_objectiveDescText != null) _objectiveDescText.text = "Tất cả học sinh đã đến nơi an toàn.";
            }
        }

        private void HandleRouteStateChanged(string routeId, RouteState state, string reason)
        {
            RefreshAllRouteBadges();
        }

        private void RefreshAllRouteBadges()
        {
            UpdateRouteBadge(_routeAText, "RouteA", "Tuyến A (Cầu suối)");
            UpdateRouteBadge(_routeBText, "RouteB", "Tuyến B (Đồi cao)");
            UpdateRouteBadge(_routeCText, "RouteC", "Tuyến C (Chân dốc)");
        }

        private void UpdateRouteBadge(TextMeshProUGUI label, string routeId, string displayName)
        {
            if (label == null || RouteManager.Instance == null) return;

            RouteData route = RouteManager.Instance.GetRoute(routeId);
            RouteState state = route != null ? route.CurrentState : RouteState.Open;

            string statusText = state switch
            {
                RouteState.Open => "<color=#2ECC71>[Thông suốt]</color>",
                RouteState.Warning => "<color=#F39C12>[Nguy hiểm]</color>",
                RouteState.Blocked => "<color=#E74C3C>[BỊ KHÓA]</color>",
                _ => "[Chưa rõ]"
            };

            label.text = $"{displayName}: {statusText}";
        }

        private void HandleScenarioEvent(ScenarioEventData eventData)
        {
            if (!string.IsNullOrEmpty(eventData.StringParameter) && _hazardBannerRoot != null && _hazardBannerText != null)
            {
                _hazardBannerRoot.SetActive(true);
                _hazardBannerText.text = $"⚠️ {eventData.StringParameter}";
            }
        }
    }
}
