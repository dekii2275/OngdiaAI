using UnityEngine;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Follows the player character maintaining a clean 2.5D / Isometric angle.
    /// Operates independently of gameplay logic, ensuring cameras can be swapped
    /// for Third-Person or VR without affecting player mechanics or scenario state.
    /// </summary>
    public class IsometricCameraController : MonoBehaviour
    {
        [Header("Target Tracking")]
        [SerializeField] private Transform _target;
        [SerializeField] private Vector3 _targetOffset = new Vector3(0f, 1.2f, 0f);

        [Header("Isometric Perspective Settings")]
        [Tooltip("Pitch tilt angle looking downward")]
        [SerializeField] private float _pitchAngle = 45f;

        [Tooltip("Yaw rotation giving the 2.5D diagonal slant")]
        [SerializeField] private float _yawAngle = 45f;

        [Tooltip("Distance from the focus point")]
        [SerializeField] private float _cameraDistance = 25f;

        [Header("Smooth Damping")]
        [SerializeField] private float _smoothTime = 0.25f;

        private Vector3 _currentVelocity = Vector3.zero;

        public Transform Target => _target;

        private void Start()
        {
            if (_target == null)
            {
                PlayerController pc = FindFirstObjectByType<PlayerController>();
                if (pc != null)
                {
                    _target = pc.transform;
                }
            }

            SnapToTarget();
        }

        private void LateUpdate()
        {
            if (_target == null) return;

            UpdateCameraTransform(false);
        }

        public void SetTarget(Transform newTarget)
        {
            _target = newTarget;
            SnapToTarget();
        }

        public void SnapToTarget()
        {
            if (_target == null) return;
            UpdateCameraTransform(true);
        }

        private void UpdateCameraTransform(bool instantaneous)
        {
            Vector3 focusPoint = _target.position + _targetOffset;

            // Compute spherical rotation and offset
            Quaternion rotation = Quaternion.Euler(_pitchAngle, _yawAngle, 0f);
            Vector3 desiredOffset = rotation * (Vector3.back * _cameraDistance);
            Vector3 desiredPosition = focusPoint + desiredOffset;

            if (instantaneous || _smoothTime <= 0.001f)
            {
                transform.position = desiredPosition;
            }
            else
            {
                transform.position = Vector3.SmoothDamp(transform.position, desiredPosition, ref _currentVelocity, _smoothTime);
            }

            transform.rotation = rotation;
        }

        private void OnValidate()
        {
            if (_target != null && !Application.isPlaying)
            {
                SnapToTarget();
            }
        }
    }
}
