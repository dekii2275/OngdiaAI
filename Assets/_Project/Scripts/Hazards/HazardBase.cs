using System;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Base class for all environmental disaster hazards in the simulation.
    /// Manages state transitions, validation, and event dispatching.
    /// Completely decoupled from renderers and visual components.
    /// </summary>
    public abstract class HazardBase : MonoBehaviour, IHazard, IScenarioEventReceiver
    {
        [Header("Hazard Identity")]
        [SerializeField] private string _hazardId = "Hazard_Generic";
        [SerializeField] private string _displayName = "Nguy cơ thiên tai";

        [Header("State")]
        [SerializeField] private HazardState _currentState = HazardState.Inactive;

        public string Id => _hazardId;
        public string DisplayName => _displayName;
        public HazardState CurrentState => _currentState;

        public event Action<IHazard, HazardState> OnHazardStateChanged;

        protected virtual void Start()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.RegisterReceiver(this);
            }
        }

        protected virtual void OnDestroy()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.UnregisterReceiver(this);
            }
        }

        /// <summary>
        /// Transitions the hazard to a new state and notifies all listeners.
        /// </summary>
        public virtual void SetHazardState(HazardState newState, string reason = null)
        {
            if (_currentState == newState) return;

            HazardState oldState = _currentState;
            _currentState = newState;

            OnStateTransition(oldState, newState, reason);
            OnHazardStateChanged?.Invoke(this, newState);

            Debug.Log($"[Hazard: {Id}] State changed from {oldState} to {newState}. Reason: {reason ?? "N/A"}");
        }

        /// <summary>
        /// Resets the hazard to Inactive.
        /// </summary>
        public virtual void ResetHazard()
        {
            SetHazardState(HazardState.Inactive, "Simulation reset");
        }

        /// <summary>
        /// Template method invoked during state transitions for concrete sub-class behaviors.
        /// </summary>
        protected abstract void OnStateTransition(HazardState oldState, HazardState newState, string reason);

        /// <summary>
        /// Handles incoming scenario events targeting this hazard.
        /// </summary>
        public abstract void OnScenarioEventReceived(ScenarioEventData eventData);
    }
}
