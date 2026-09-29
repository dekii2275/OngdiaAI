using UnityEngine;
using UnityEngine.AI;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Dynamic obstacle that carves the NavMesh and closes physical passage
    /// whenever its associated evacuation route is flagged as Blocked.
    /// Forces NPCs using NavMeshAgent and players to divert to safe routes.
    /// </summary>
    [RequireComponent(typeof(NavMeshObstacle))]
    public class DynamicRouteObstacle : MonoBehaviour
    {
        [Header("Route Binding")]
        [SerializeField] private string _boundRouteId = "RouteA";

        [Header("Obstacle Components")]
        [SerializeField] private NavMeshObstacle _navObstacle;
        [SerializeField] private Collider _physicalBarrierCollider;
        [SerializeField] private GameObject _visualObstacle;

        private void Awake()
        {
            if (_navObstacle == null)
            {
                _navObstacle = GetComponent<NavMeshObstacle>();
            }

            if (_navObstacle != null)
            {
                _navObstacle.carving = true;
                _navObstacle.enabled = false; // Initially inactive
            }

            if (_physicalBarrierCollider != null)
            {
                _physicalBarrierCollider.enabled = false;
            }

            if (_visualObstacle != null)
            {
                _visualObstacle.SetActive(false);
            }
        }

        private void Start()
        {
            if (RouteManager.Instance != null)
            {
                RouteManager.Instance.OnRouteStateChanged += HandleRouteStateChanged;

                RouteData current = RouteManager.Instance.GetRoute(_boundRouteId);
                if (current != null && current.CurrentState == RouteState.Blocked)
                {
                    ActivateObstacle(true);
                }
            }
        }

        private void OnDestroy()
        {
            if (RouteManager.Instance != null)
            {
                RouteManager.Instance.OnRouteStateChanged -= HandleRouteStateChanged;
            }
        }

        private void HandleRouteStateChanged(string routeId, RouteState newState, string reason)
        {
            if (string.Equals(routeId, _boundRouteId, System.StringComparison.OrdinalIgnoreCase))
            {
                ActivateObstacle(newState == RouteState.Blocked);
            }
        }

        public void ActivateObstacle(bool isBlocked)
        {
            if (_navObstacle != null)
            {
                _navObstacle.enabled = isBlocked;
            }

            if (_physicalBarrierCollider != null)
            {
                _physicalBarrierCollider.enabled = isBlocked;
            }

            if (_visualObstacle != null)
            {
                _visualObstacle.SetActive(isBlocked);
            }

            Debug.Log($"[DynamicRouteObstacle] Obstacle for '{_boundRouteId}' is {(isBlocked ? "ACTIVE (Path Blocked)" : "INACTIVE (Path Clear)")}");
        }
    }
}
