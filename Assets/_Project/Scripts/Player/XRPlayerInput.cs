using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// XR / VR implementation of IPlayerInput for Meta Quest / OpenXR controllers.
    /// Ready to bind directly with XR Interaction Toolkit or OpenXR Action Maps.
    /// Swappable at runtime without altering PlayerController logic.
    /// </summary>
    public class XRPlayerInput : MonoBehaviour, IPlayerInput
    {
        [Header("XR Input Emulation / Binding")]
        [Tooltip("Direct hook for XR continuous locomotion thumbstick")]
        [SerializeField] private Vector2 _xrThumbstickAxis = Vector2.zero;
        [SerializeField] private bool _xrSprintModifier = false;
        [SerializeField] private bool _xrPrimaryTriggerPressed = false;
        [SerializeField] private bool _xrMenuButtonPressed = false;

        public Vector2 MoveInput => _xrThumbstickAxis;
        public bool IsSprinting => _xrSprintModifier;
        public bool InteractTriggered => _xrPrimaryTriggerPressed;
        public bool CancelTriggered => _xrMenuButtonPressed;

        /// <summary>
        /// Feeds thumbstick axis from OpenXR Action or XR Controller.
        /// </summary>
        public void SetThumbstickAxis(Vector2 axis)
        {
            _xrThumbstickAxis = axis;
        }

        /// <summary>
        /// Feeds interaction trigger click from XR Hand/Controller.
        /// </summary>
        public void TriggerInteraction()
        {
            _xrPrimaryTriggerPressed = true;
        }

        private void LateUpdate()
        {
            // Reset one-frame triggers
            _xrPrimaryTriggerPressed = false;
            _xrMenuButtonPressed = false;
        }
    }
}
