using System;
using System.Collections.Generic;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// ScriptableObject defining an educational disaster scenario, its timeline, routes, and checkpoints.
    /// Decoupled from scenes and fully authorable in the Inspector.
    /// </summary>
    [CreateAssetMenu(fileName = "NewScenarioData", menuName = "DisasterSim/Scenario Data")]
    public class ScenarioData : ScriptableObject
    {
        [Header("Scenario Identity")]
        [SerializeField] private string _scenarioId = "SCN_FLASH_FLOOD_01";
        [SerializeField] private string _displayName = "Sơ tán Khẩn cấp: Lũ quét & Sạt lở đất";
        [TextArea(2, 4)]
        [SerializeField] private string _description = "Hướng dẫn học sinh nhận biết nguy cơ lũ quét từ thượng nguồn và sạt lở taluy dương, lựa chọn tuyến sơ tán an toàn lên cao điểm.";

        [Header("Simulation Timing")]
        [Tooltip("Target duration in seconds for the complete scenario timeline")]
        [SerializeField] private float _durationSeconds = 480f; // 8 minutes

        [Header("Timeline Events")]
        [SerializeField] private List<ScenarioEventData> _timelineEvents = new List<ScenarioEventData>();

        [Header("Initial Route Configurations")]
        [SerializeField] private List<RouteConfig> _routes = new List<RouteConfig>();

        public string ScenarioId => _scenarioId;
        public string DisplayName => _displayName;
        public string Description => _description;
        public float DurationSeconds => _durationSeconds;
        public IReadOnlyList<ScenarioEventData> TimelineEvents => _timelineEvents;
        public IReadOnlyList<RouteConfig> Routes => _routes;

        public void SetData(string id, string displayName, float duration, List<ScenarioEventData> events, List<RouteConfig> routes)
        {
            _scenarioId = id;
            _displayName = displayName;
            _durationSeconds = duration;
            _timelineEvents = events ?? new List<ScenarioEventData>();
            _routes = routes ?? new List<RouteConfig>();
        }
    }

    [Serializable]
    public struct RouteConfig
    {
        public string RouteId;
        public string RouteName;
        public RouteState InitialState;
        [TextArea(1, 2)]
        public string Description;

        public RouteConfig(string id, string name, RouteState state, string desc = "")
        {
            RouteId = id;
            RouteName = name;
            InitialState = state;
            Description = desc;
        }
    }
}
