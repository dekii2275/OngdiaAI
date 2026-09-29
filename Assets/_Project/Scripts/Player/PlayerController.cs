using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Core locomotion controller for the student player character.
    /// Operates on camera-relative coordinates and abstracts input via IPlayerInput,
    /// ensuring seamless compatibility with 2.5D Isometric, 3D Third-Person, and VR.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Locomotion Speeds")]
        [SerializeField] private float _walkSpeed = 4.5f;
        [SerializeField] private float _sprintSpeed = 7.5f;
        [SerializeField] private float _rotationSpeed = 720f;
        [SerializeField] private float _gravity = -18f;

        [Header("Camera Relative Reference")]
        [SerializeField] private Transform _cameraTransform;

        private CharacterController _characterController;
        private IPlayerInput _playerInput;
        private Vector3 _verticalVelocity = Vector3.zero;

        public CharacterController CharacterController => _characterController;
        public IPlayerInput PlayerInput => _playerInput;
        public bool IsGrounded => _characterController != null && _characterController.isGrounded;
        public Vector3 Velocity => _characterController != null ? _characterController.velocity : Vector3.zero;

        private void Awake()
        {
            _characterController = GetComponent<CharacterController>();
            _playerInput = GetComponent<IPlayerInput>();

            if (_playerInput == null)
            {
                // Auto-attach default desktop input if none present
                _playerInput = gameObject.AddComponent<DesktopPlayerInput>();
            }

            if (_cameraTransform == null && Camera.main != null)
            {
                _cameraTransform = Camera.main.transform;
            }
        }

        private void Update()
        {
            // Pause movement if game is paused or concluded
            if (GameManager.Instance != null && GameManager.Instance.CurrentState != GameState.Playing)
            {
                return;
            }

            HandleMovement();
        }

        public void SetCameraReference(Transform camTransform)
        {
            _cameraTransform = camTransform;
        }

        public void SetInputSource(IPlayerInput input)
        {
            _playerInput = input;
        }

        private void HandleMovement()
        {
            if (_playerInput == null || _characterController == null) return;

            Vector2 input = _playerInput.MoveInput;
            float currentSpeed = _playerInput.IsSprinting ? _sprintSpeed : _walkSpeed;

            // Calculate movement vector relative to camera perspective
            Vector3 moveDirection = Vector3.zero;
            if (_cameraTransform != null)
            {
                Vector3 camForward = _cameraTransform.forward;
                Vector3 camRight = _cameraTransform.right;

                // Flatten camera vectors onto horizontal ground plane
                camForward.y = 0f;
                camRight.y = 0f;
                camForward.Normalize();
                camRight.Normalize();

                moveDirection = (camForward * input.y) + (camRight * input.x);
            }
            else
            {
                moveDirection = new Vector3(input.x, 0f, input.y);
            }

            if (moveDirection.sqrMagnitude > 0.001f)
            {
                moveDirection.Normalize();

                // Rotate player towards movement heading
                Quaternion targetRotation = Quaternion.LookRotation(moveDirection, Vector3.up);
                transform.rotation = Quaternion.RotateTowards(transform.rotation, targetRotation, _rotationSpeed * Time.deltaTime);
            }

            // Apply gravity
            if (_characterController.isGrounded)
            {
                if (_verticalVelocity.y < 0f)
                {
                    _verticalVelocity.y = -2f; // Keep grounded stickiness
                }
            }
            else
            {
                _verticalVelocity.y += _gravity * Time.deltaTime;
            }

            // Combine horizontal motion and vertical gravity
            Vector3 finalMotion = (moveDirection * currentSpeed) + _verticalVelocity;
            _characterController.Move(finalMotion * Time.deltaTime);
        }
    }
}
