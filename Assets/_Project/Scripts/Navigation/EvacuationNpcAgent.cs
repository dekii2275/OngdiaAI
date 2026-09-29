using UnityEngine;
using UnityEngine.AI;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Demonstrates autonomous evacuation behavior for student/teacher NPCs.
    /// Traverses from the school to the Safe Zone, detecting route blockages
    /// and recalculating paths to safe alternative routes dynamically.
    /// </summary>
    [RequireComponent(typeof(NavMeshAgent))]
    public class EvacuationNpcAgent : MonoBehaviour
    {
        [Header("Waypoints & Destinations")]
        [SerializeField] private Transform _primaryRouteWaypoint; // e.g. Route A bridge entrance
        [SerializeField] private Transform _safeRouteWaypoint;    // e.g. Route B hill path entrance
        [SerializeField] private Transform _safeZoneDestination;   // Final assembly point

        [Header("Route Preference")]
        [SerializeField] private string _currentAssignedRouteId = "RouteA";
        [SerializeField] private string _safeFallbackRouteId = "RouteB";

        [Header("Agent Attributes")]
        [SerializeField] private float _evacuateSpeed = 3.5f;
        [SerializeField] private float _stoppingDistance = 1.0f;

        private NavMeshAgent _agent;
        private bool _isEvacuating = false;
        private bool _hasRerouted = false;

        public bool HasReachedSafeZone { get; private set; }

        private void Awake()
        {
            _agent = GetComponent<NavMeshAgent>();
            if (_agent != null)
            {
                _agent.speed = _evacuateSpeed;
                _agent.stoppingDistance = _stoppingDistance;
            }
        }

        private void Start()
        {
            if (RouteManager.Instance != null)
            {
                RouteManager.Instance.OnRouteStateChanged += HandleRouteChanged;
            }

            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameStarted += StartEvacuation;
            }

            // Start immediately if game is already playing
            if (GameManager.Instance != null && GameManager.Instance.CurrentState == GameState.Playing)
            {
                StartEvacuation();
            }
        }

        private void Update()
        {
            if (!_isEvacuating || _agent == null || HasReachedSafeZone) return;

            // Check if agent arrived at safe zone
            if (_safeZoneDestination != null && Vector3.Distance(transform.position, _safeZoneDestination.position) <= _stoppingDistance + 0.5f)
            {
                HasReachedSafeZone = true;
                Debug.Log($"[EvacuationNpcAgent: {gameObject.name}] Successfully reached Safe Zone!");
                return;
            }

            // If agent gets stuck due to newly carved NavMeshObstacle
            if (!_hasRerouted && _agent.hasPath && (_agent.pathStatus == NavMeshPathStatus.PathPartial || _agent.pathStatus == NavMeshPathStatus.PathInvalid))
            {
                RerouteToSafePath("Phát hiện vật cản/đường bị chia cắt trên NavMesh!");
            }
        }

        private void OnDestroy()
        {
            if (RouteManager.Instance != null)
            {
                RouteManager.Instance.OnRouteStateChanged -= HandleRouteChanged;
            }

            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnGameStarted -= StartEvacuation;
            }
        }

        public void StartEvacuation()
        {
            _isEvacuating = true;

            // If primary route is already blocked before starting, take safe route immediately
            if (RouteManager.Instance != null && !RouteManager.Instance.IsRouteOpen(_currentAssignedRouteId))
            {
                RerouteToSafePath("Tuyến ban đầu đã bị phong tỏa trước khi xuất phát.");
            }
            else
            {
                SetTargetWaypoint(_primaryRouteWaypoint != null ? _primaryRouteWaypoint : _safeZoneDestination);
            }
        }

        private void HandleRouteChanged(string routeId, RouteState newState, string reason)
        {
            if (string.Equals(routeId, _currentAssignedRouteId, System.StringComparison.OrdinalIgnoreCase))
            {
                if (newState == RouteState.Blocked)
                {
                    RerouteToSafePath(reason);
                }
            }
        }

        public void RerouteToSafePath(string reason)
        {
            if (_hasRerouted) return;
            _hasRerouted = true;
            _currentAssignedRouteId = _safeFallbackRouteId;

            Debug.Log($"[EvacuationNpcAgent: {gameObject.name}] REROUTING to {_safeFallbackRouteId}. Reason: {reason}");

            if (_safeRouteWaypoint != null)
            {
                SetTargetWaypoint(_safeRouteWaypoint);
            }
            else if (_safeZoneDestination != null)
            {
                SetTargetWaypoint(_safeZoneDestination);
            }
        }

        public void SetTargetWaypoint(Transform target)
        {
            if (target != null && _agent != null && _agent.isOnNavMesh)
            {
                _agent.SetDestination(target.position);
            }
        }
    }
}
