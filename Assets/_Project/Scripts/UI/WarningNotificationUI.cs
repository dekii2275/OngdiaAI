using System.Collections;
using UnityEngine;
using TMPro;
using DisasterSim.Core;
using DisasterSim.Gameplay;

namespace DisasterSim.UI
{
    /// <summary>
    /// Displays prominent emergency alerts when disasters escalate or warnings trigger.
    /// </summary>
    public class WarningNotificationUI : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject _alertPanelRoot;
        [SerializeField] private TextMeshProUGUI _alertTitleText;
        [SerializeField] private TextMeshProUGUI _alertBodyText;
        [SerializeField] private float _displayDuration = 6.0f;

        private Coroutine _hideCoroutine;

        private void Start()
        {
            if (_alertPanelRoot != null)
            {
                _alertPanelRoot.SetActive(false);
            }

            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.OnScenarioEventTriggered += HandleScenarioEvent;
            }
        }

        private void OnDestroy()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.OnScenarioEventTriggered -= HandleScenarioEvent;
            }
        }

        private void HandleScenarioEvent(ScenarioEventData eventData)
        {
            string title = eventData.EventType switch
            {
                ScenarioEventType.WarningIssued => "CẢNH BÁO KHẨN CẤP",
                ScenarioEventType.RiverLevelRaised => "NƯỚC SUỐI DÂNG NHANH",
                ScenarioEventType.BridgeWarning => "CẦU TẠM NGUY HIỂM",
                ScenarioEventType.BridgeBlocked => "CẦU BỊ CUỐN SẬP",
                ScenarioEventType.RockfallStarted => "ĐÁ LĂN SƯỜN DỐC",
                ScenarioEventType.LandslideStarted => "SẠT LỞ ĐẤT ĐẶC BIỆT NGUY HIỂM",
                _ => "THÔNG BÁO TÌNH HUỐNG"
            };

            ShowNotification(title, eventData.StringParameter);
        }

        public void ShowNotification(string title, string message)
        {
            if (string.IsNullOrEmpty(message)) return;

            if (_alertPanelRoot != null)
            {
                _alertPanelRoot.SetActive(true);
            }

            if (_alertTitleText != null) _alertTitleText.text = title;
            if (_alertBodyText != null) _alertBodyText.text = message;

            if (_hideCoroutine != null)
            {
                StopCoroutine(_hideCoroutine);
            }
            _hideCoroutine = StartCoroutine(AutoHideRoutine());
        }

        private IEnumerator AutoHideRoutine()
        {
            yield return new WaitForSecondsRealtime(_displayDuration);
            if (_alertPanelRoot != null)
            {
                _alertPanelRoot.SetActive(false);
            }
        }
    }
}
