using System;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Educational landslide and slope failure hazard simulation.
    /// Manages conceptual stages: Normal -> CrackDetected -> Rockfall -> Landslide -> Blocked.
    /// Connects to RouteManager to invalidate routes passing along hazardous slopes.
    /// </summary>
    public class LandslideHazard : HazardBase
    {
        [Header("Landslide Specifics")]
        [SerializeField] private LandslideState _landslideState = LandslideState.Normal;
        [SerializeField] private string _boundRouteId = "RouteC";
        [Range(0f, 1f)]
        [SerializeField] private float _debrisAmountNormalized = 0f;

        public LandslideState CurrentLandslideState => _landslideState;
        public float DebrisAmountNormalized => _debrisAmountNormalized;
        public string BoundRouteId => _boundRouteId;

        public event Action<LandslideHazard, LandslideState> OnLandslideStateChanged;

        /// <summary>
        /// Explicit transition through conceptual landslide progression states.
        /// </summary>
        public void SetLandslideState(LandslideState state, string reason = null)
        {
            if (_landslideState == state) return;

            _landslideState = state;

            // Map conceptual landslide state to generic hazard state
            HazardState genericState = state switch
            {
                LandslideState.Normal => HazardState.Inactive,
                LandslideState.CrackDetected => HazardState.Warning,
                LandslideState.Rockfall => HazardState.Dangerous,
                LandslideState.Landslide => HazardState.Dangerous,
                LandslideState.Blocked => HazardState.Blocked,
                _ => HazardState.Inactive
            };

            // Update debris amount parameter
            _debrisAmountNormalized = state switch
            {
                LandslideState.Normal => 0.0f,
                LandslideState.CrackDetected => 0.1f,
                LandslideState.Rockfall => 0.4f,
                LandslideState.Landslide => 0.85f,
                LandslideState.Blocked => 1.0f,
                _ => 0f
            };

            SetHazardState(genericState, reason);
            OnLandslideStateChanged?.Invoke(this, _landslideState);

            // Synchronize with RouteManager
            if (!string.IsNullOrEmpty(_boundRouteId) && RouteManager.Instance != null)
            {
                if (state == LandslideState.CrackDetected)
                {
                    RouteManager.Instance.SetRouteState(_boundRouteId, RouteState.Warning, "Xuất hiện vết nứt taluy dương nguy hiểm!");
                }
                else if (state >= LandslideState.Rockfall)
                {
                    RouteManager.Instance.SetRouteState(_boundRouteId, RouteState.Blocked, "Đất đá sạt trượt vùi lấp mặt đường Tuyến C!");
                }
            }
        }

        protected override void OnStateTransition(HazardState oldState, HazardState newState, string reason)
        {
            // Internal behavior hooks
        }

        public override void ResetHazard()
        {
            _landslideState = LandslideState.Normal;
            _debrisAmountNormalized = 0f;
            base.ResetHazard();
        }

        public override void OnScenarioEventReceived(ScenarioEventData eventData)
        {
            if (eventData.EventType == ScenarioEventType.RockfallStarted)
            {
                SetLandslideState(LandslideState.Rockfall, eventData.StringParameter);
            }
            else if (eventData.EventType == ScenarioEventType.LandslideStarted)
            {
                SetLandslideState(LandslideState.Blocked, eventData.StringParameter);
            }
        }
    }
}
