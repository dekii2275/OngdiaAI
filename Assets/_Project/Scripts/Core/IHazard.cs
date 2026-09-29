using System;

namespace DisasterSim.Core
{
    /// <summary>
    /// Contract for all simulation hazards (e.g. Flash Flood, Landslide, Rockfall).
    /// Decoupled from mesh renderers, particle systems, or visual representations.
    /// </summary>
    public interface IHazard
    {
        /// <summary>
        /// Unique identifier for this hazard instance.
        /// </summary>
        string Id { get; }

        /// <summary>
        /// Human-readable localized title of the hazard.
        /// </summary>
        string DisplayName { get; }

        /// <summary>
        /// Current high-level operational hazard state.
        /// </summary>
        HazardState CurrentState { get; }

        /// <summary>
        /// Fired whenever the hazard transitions to a different state.
        /// </summary>
        event Action<IHazard, HazardState> OnHazardStateChanged;

        /// <summary>
        /// Manually or programmatically command the hazard to transition to a new state.
        /// </summary>
        void SetHazardState(HazardState newState, string reason = null);

        /// <summary>
        /// Resets the hazard to its initial resting state.
        /// </summary>
        void ResetHazard();
    }
}
