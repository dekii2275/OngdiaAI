using System;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Educational flash flood hazard simulation.
    /// Manages conceptual stages: Normal -> Rising -> Dangerous -> Blocked.
    /// Connects to RouteManager to invalidate low-lying or bridge paths when flooded.
    /// </summary>
    public class FloodHazard : HazardBase
    {
        [Header("Flood Specifics")]
        [SerializeField] private FloodState _floodState = FloodState.Normal;
        [SerializeField] private string _boundRouteId = "RouteA";
        [Range(0f, 1f)]
        [SerializeField] private float _waterLevelNormalized = 0f;

        public FloodState CurrentFloodState => _floodState;
        public float WaterLevelNormalized => _waterLevelNormalized;
        public string BoundRouteId => _boundRouteId;

        public event Action<FloodHazard, FloodState> OnFloodStateChanged;

        /// <summary>
        /// Explicit transition through conceptual flash flood progression states.
        /// </summary>
        public void SetFloodState(FloodState state, string reason = null)
        {
            if (_floodState == state) return;

            _floodState = state;

            // Map conceptual flood state to generic hazard state
            HazardState genericState = state switch
            {
                FloodState.Normal => HazardState.Inactive,
                FloodState.Rising => HazardState.Warning,
                FloodState.Dangerous => HazardState.Dangerous,
                FloodState.Blocked => HazardState.Blocked,
                _ => HazardState.Inactive
            };

            // Update water level parameter
            _waterLevelNormalized = state switch
            {
                FloodState.Normal => 0.0f,
                FloodState.Rising => 0.35f,
                FloodState.Dangerous => 0.75f,
                FloodState.Blocked => 1.0f,
                _ => 0f
            };

            SetHazardState(genericState, reason);
            OnFloodStateChanged?.Invoke(this, _floodState);

            // Synchronize with RouteManager if route is bound
            if (!string.IsNullOrEmpty(_boundRouteId) && RouteManager.Instance != null)
            {
                if (state == FloodState.Rising)
                {
                    RouteManager.Instance.SetRouteState(_boundRouteId, RouteState.Warning, "Mực nước lũ đang dâng cao gần mặt cầu!");
                }
                else if (state >= FloodState.Dangerous)
                {
                    RouteManager.Instance.SetRouteState(_boundRouteId, RouteState.Blocked, "Nước lũ tràn ngập và cuốn sập cầu tạm!");
                }
            }
        }

        protected override void OnStateTransition(HazardState oldState, HazardState newState, string reason)
        {
            // Internal logic updates when generic state changes
        }

        public override void ResetHazard()
        {
            _floodState = FloodState.Normal;
            _waterLevelNormalized = 0f;
            base.ResetHazard();
        }

        public override void OnScenarioEventReceived(ScenarioEventData eventData)
        {
            if (eventData.EventType == ScenarioEventType.RiverLevelRaised)
            {
                SetFloodState(FloodState.Rising, eventData.StringParameter);
            }
            else if (eventData.EventType == ScenarioEventType.BridgeWarning)
            {
                SetFloodState(FloodState.Dangerous, eventData.StringParameter);
            }
            else if (eventData.EventType == ScenarioEventType.BridgeBlocked)
            {
                SetFloodState(FloodState.Blocked, eventData.StringParameter);
            }
        }
    }
}
