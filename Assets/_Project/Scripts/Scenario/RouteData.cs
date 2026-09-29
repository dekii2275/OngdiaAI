using System;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// ScriptableObject defining metadata for an evacuation route.
    /// </summary>
    [CreateAssetMenu(fileName = "NewRouteData", menuName = "DisasterSim/Route Data")]
    public class RouteData : ScriptableObject, IRoute
    {
        [Header("Route Identity")]
        [SerializeField] private string _routeId = "RouteA";
        [SerializeField] private string _routeName = "Tuyến A - Qua cầu suối";
        [TextArea(2, 4)]
        [SerializeField] private string _description = "Tuyến đường ngắn nhất dẫn về điểm tập kết, nhưng bắc qua cầu tạm suối cạn.";

        [Header("Initial State")]
        [SerializeField] private RouteState _initialState = RouteState.Open;

        [Header("Runtime State")]
        [SerializeField] private RouteState _currentState = RouteState.Open;

        public string RouteId => _routeId;
        public string RouteName => _routeName;
        public string Description => _description;
        public RouteState CurrentState => _currentState;

        public event Action<IRoute, RouteState> OnRouteStateChanged;

        private void OnEnable()
        {
            _currentState = _initialState;
        }

        public void Initialize(string id, string name, RouteState initialState, string desc = "")
        {
            _routeId = id;
            _routeName = name;
            _initialState = initialState;
            _currentState = initialState;
            _description = desc;
        }

        public void SetState(RouteState newState, string reason = null)
        {
            if (_currentState == newState) return;

            RouteState oldState = _currentState;
            _currentState = newState;

            OnRouteStateChanged?.Invoke(this, newState);

            Debug.Log($"[Route: {RouteId}] State changed from {oldState} to {newState}. Reason: {reason ?? "N/A"}");
        }

        public void ResetRoute()
        {
            SetState(_initialState, "Reset");
        }
    }
}
