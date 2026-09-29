using UnityEngine;
using DisasterSim.Core;

#if ENABLE_INPUT_SYSTEM
using UnityEngine.InputSystem;
#endif

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Desktop implementation of IPlayerInput for PC / Keyboard / Gamepad control.
    /// Utilizes Unity Input System with fallback compatibility.
    /// </summary>
    public class DesktopPlayerInput : MonoBehaviour, IPlayerInput
    {
        public Vector2 MoveInput { get; private set; }
        public bool IsSprinting { get; private set; }
        public bool InteractTriggered { get; private set; }
        public bool CancelTriggered { get; private set; }

        private void Update()
        {
            ReadInput();
        }

        private void ReadInput()
        {
#if ENABLE_INPUT_SYSTEM
            if (Keyboard.current != null)
            {
                // Reading via Unity Input System Keyboard
                float x = 0f;
                float y = 0f;

                if (Keyboard.current.wKey.isPressed || Keyboard.current.upArrowKey.isPressed) y += 1f;
                if (Keyboard.current.sKey.isPressed || Keyboard.current.downArrowKey.isPressed) y -= 1f;
                if (Keyboard.current.aKey.isPressed || Keyboard.current.leftArrowKey.isPressed) x -= 1f;
                if (Keyboard.current.dKey.isPressed || Keyboard.current.rightArrowKey.isPressed) x += 1f;

                MoveInput = new Vector2(x, y).normalized;
                IsSprinting = Keyboard.current.leftShiftKey.isPressed;
                InteractTriggered = Keyboard.current.eKey.wasPressedThisFrame;
                CancelTriggered = Keyboard.current.escapeKey.wasPressedThisFrame;
                return;
            }
#endif

            // Fallback for editor compatibility if Input System package is initializing
            float legacyX = Input.GetAxisRaw("Horizontal");
            float legacyY = Input.GetAxisRaw("Vertical");
            MoveInput = new Vector2(legacyX, legacyY).normalized;
            IsSprinting = Input.GetKey(KeyCode.LeftShift);
            InteractTriggered = Input.GetKeyDown(KeyCode.E);
            CancelTriggered = Input.GetKeyDown(KeyCode.Escape);
        }
    }
}
