using System;
using System.Collections.Generic;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Central manager controlling the availability and hazard states of all evacuation corridors.
    /// Informs navigation systems and UI whenever paths are compromised by environmental disasters.
    /// </summary>
    public class RouteManager : MonoBehaviour, IScenarioEventReceiver
    {
        public static RouteManager Instance { get; private set; }

        [Header("Configured Routes")]
        [SerializeField] private List<RouteData> _configuredRoutes = new List<RouteData>();

        private readonly Dictionary<string, RouteData> _routeMap = new Dictionary<string, RouteData>(StringComparer.OrdinalIgnoreCase);

        public IReadOnlyCollection<RouteData> AllRoutes => _routeMap.Values;

        public event Action<string, RouteState, string> OnRouteStateChanged;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            InitializeRoutes();
        }

        private void Start()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.RegisterReceiver(this);
            }
        }

        private void OnDestroy()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.UnregisterReceiver(this);
            }

            if (Instance == this)
            {
                Instance = null;
            }
        }

        private void InitializeRoutes()
        {
            _routeMap.Clear();

            // Register serialized routes
            for (int i = 0; i < _configuredRoutes.Count; i++)
            {
                RouteData route = _configuredRoutes[i];
                if (route != null && !string.IsNullOrEmpty(route.RouteId))
                {
                    _routeMap[route.RouteId] = route;
                }
            }

            // Create default routes if empty
            if (_routeMap.Count == 0)
            {
                CreateRuntimeRoute("RouteA", "Tuyến A - Đường qua cầu suối", RouteState.Open, "Tuyến qua suối, nguy cơ lũ quét cao.");
                CreateRuntimeRoute("RouteB", "Tuyến B - Đường sườn đồi cao", RouteState.Open, "Tuyến sơ tán cao điểm, an toàn nhất.");
                CreateRuntimeRoute("RouteC", "Tuyến C - Đường men chân dốc", RouteState.Open, "Tuyến men chân vách dốc, nguy cơ sạt trượt.");
            }
        }

        private void CreateRuntimeRoute(string id, string name, RouteState initialState, string desc)
        {
            RouteData r = ScriptableObject.CreateInstance<RouteData>();
            r.Initialize(id, name, initialState, desc);
            _routeMap[id] = r;
        }

        /// <summary>
        /// Retrieves route metadata by identifier.
        /// </summary>
        public RouteData GetRoute(string routeId)
        {
            if (string.IsNullOrEmpty(routeId)) return null;
            _routeMap.TryGetValue(routeId, out RouteData route);
            return route;
        }

        /// <summary>
        /// Checks if a route exists and is open for evacuation.
        /// </summary>
        public bool IsRouteOpen(string routeId)
        {
            RouteData route = GetRoute(routeId);
            return route != null && route.CurrentState == RouteState.Open;
        }

        /// <summary>
        /// Changes the status of an evacuation route and notifies listeners (NPC navigation, UI, ActionLog).
        /// </summary>
        public void SetRouteState(string routeId, RouteState newState, string reason = null)
        {
            RouteData route = GetRoute(routeId);
            if (route == null)
            {
                Debug.LogWarning($"[RouteManager] Attempted to set state for unknown route: {routeId}");
                return;
            }

            if (route.CurrentState == newState) return;

            route.SetState(newState, reason);
            OnRouteStateChanged?.Invoke(routeId, newState, reason);

            // Record into player action log for situational awareness tracking
            if (PlayerActionLog.Instance != null && newState == RouteState.Blocked)
            {
                PlayerActionLog.Instance.RecordAction(
                    $"Tuyến sơ tán bị phong tỏa: {route.RouteName}",
                    routeId,
                    0
                );
            }
        }

        public void OnScenarioEventReceived(ScenarioEventData eventData)
        {
            if (eventData.EventType == ScenarioEventType.RouteBlocked && !string.IsNullOrEmpty(eventData.TargetId))
            {
                SetRouteState(eventData.TargetId, RouteState.Blocked, eventData.StringParameter);
            }
            else if (eventData.EventType == ScenarioEventType.BridgeBlocked)
            {
                SetRouteState("RouteA", RouteState.Blocked, "Cầu tạm bị cuốn sập.");
            }
            else if (eventData.EventType == ScenarioEventType.LandslideStarted)
            {
                SetRouteState("RouteC", RouteState.Blocked, "Đất đá vùi lấp mặt đường.");
            }
        }
    }
}
