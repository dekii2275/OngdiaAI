using System;
using System.Collections.Generic;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Manages playback of scenario timeline events, elapsed time, and broadcasts triggers to hazards and routes.
    /// Not hard-coded to any specific scene or visuals.
    /// </summary>
    public class ScenarioManager : MonoBehaviour
    {
        public static ScenarioManager Instance { get; private set; }

        [Header("Scenario Configuration")]
        [SerializeField] private ScenarioData _activeScenario;
        [SerializeField] private bool _autoPlayOnStart = true;

        [Header("Runtime State")]
        [SerializeField] private float _elapsedTime = 0f;
        [SerializeField] private bool _isRunning = false;

        private readonly List<IScenarioEventReceiver> _eventReceivers = new List<IScenarioEventReceiver>();
        private readonly HashSet<string> _triggeredEventIds = new HashSet<string>();
        private List<ScenarioEventData> _sortedEvents = new List<ScenarioEventData>();

        public ScenarioData ActiveScenario => _activeScenario;
        public float ElapsedTime => _elapsedTime;
        public bool IsRunning => _isRunning;

        public event Action<ScenarioData> OnScenarioLoaded;
        public event Action<ScenarioEventData> OnScenarioEventTriggered;
        public event Action<float> OnTimeUpdated;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        private void Start()
        {
            if (_activeScenario != null)
            {
                LoadScenario(_activeScenario);
            }

            if (_autoPlayOnStart && GameManager.Instance != null && GameManager.Instance.CurrentState == GameState.Playing)
            {
                StartScenario();
            }
        }

        private void Update()
        {
            if (!_isRunning) return;

            _elapsedTime += Time.deltaTime;
            OnTimeUpdated?.Invoke(_elapsedTime);

            EvaluateEvents();
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        /// <summary>
        /// Registers a receiver to receive scenario timeline events.
        /// </summary>
        public void RegisterReceiver(IScenarioEventReceiver receiver)
        {
            if (receiver != null && !_eventReceivers.Contains(receiver))
            {
                _eventReceivers.Add(receiver);
            }
        }

        /// <summary>
        /// Unregisters a previously registered event receiver.
        /// </summary>
        public void UnregisterReceiver(IScenarioEventReceiver receiver)
        {
            _eventReceivers.Remove(receiver);
        }

        /// <summary>
        /// Loads a new scenario dataset, resetting timeline state.
        /// </summary>
        public void LoadScenario(ScenarioData data)
        {
            _activeScenario = data;
            _elapsedTime = 0f;
            _triggeredEventIds.Clear();

            _sortedEvents = new List<ScenarioEventData>();
            if (_activeScenario != null && _activeScenario.TimelineEvents != null)
            {
                _sortedEvents.AddRange(_activeScenario.TimelineEvents);
                _sortedEvents.Sort((a, b) => a.TriggerTimeSeconds.CompareTo(b.TriggerTimeSeconds));
            }

            OnScenarioLoaded?.Invoke(_activeScenario);
        }

        public void StartScenario()
        {
            _isRunning = true;
        }

        public void PauseScenario()
        {
            _isRunning = false;
        }

        public void ResumeScenario()
        {
            _isRunning = true;
        }

        public void ResetScenario()
        {
            _elapsedTime = 0f;
            _triggeredEventIds.Clear();
            _isRunning = false;
        }

        /// <summary>
        /// Fast-forwards simulation elapsed time to a specific target second and evaluates any skipped events.
        /// </summary>
        public void JumpToTime(float targetSeconds)
        {
            _elapsedTime = Mathf.Max(0f, targetSeconds);
            EvaluateEvents();
            OnTimeUpdated?.Invoke(_elapsedTime);
        }

        /// <summary>
        /// Manually triggers a scenario event immediately (useful for debug panels and tests).
        /// </summary>
        public void TriggerEventDirectly(ScenarioEventData eventData)
        {
            BroadcastEvent(eventData);
        }

        private void EvaluateEvents()
        {
            if (_sortedEvents == null) return;

            for (int i = 0; i < _sortedEvents.Count; i++)
            {
                ScenarioEventData ev = _sortedEvents[i];
                if (_elapsedTime >= ev.TriggerTimeSeconds && !_triggeredEventIds.Contains(ev.EventId))
                {
                    _triggeredEventIds.Add(ev.EventId);
                    BroadcastEvent(ev);
                }
            }
        }

        private void BroadcastEvent(ScenarioEventData eventData)
        {
            OnScenarioEventTriggered?.Invoke(eventData);

            for (int i = 0; i < _eventReceivers.Count; i++)
            {
                try
                {
                    _eventReceivers[i]?.OnScenarioEventReceived(eventData);
                }
                catch (Exception ex)
                {
                    Debug.LogError($"[ScenarioManager] Exception in event receiver: {ex.Message}");
                }
            }
        }
    }
}
