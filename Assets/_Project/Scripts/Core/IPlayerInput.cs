using UnityEngine;

namespace DisasterSim.Core
{
    /// <summary>
    /// Abstraction for player locomotion and interaction input.
    /// Enables switching between Keyboard/Mouse (Desktop 2.5D/3D) and XR Controllers (Meta Quest/OpenXR)
    /// without changing a single line of PlayerController locomotion logic.
    /// </summary>
    public interface IPlayerInput
    {
        /// <summary>
        /// Movement vector in 2D space (X = horizontal, Y = vertical).
        /// </summary>
        Vector2 MoveInput { get; }

        /// <summary>
        /// Whether the sprint/run modifier is held.
        /// </summary>
        bool IsSprinting { get; }

        /// <summary>
        /// True on the exact frame the interaction action was pressed.
        /// </summary>
        bool InteractTriggered { get; }

        /// <summary>
        /// True on the exact frame the cancel/pause action was pressed.
        /// </summary>
        bool CancelTriggered { get; }
    }
}
