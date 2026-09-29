using System;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Coordinates camera mode abstractions (Isometric, ThirdPerson, VR).
    /// Provides an architectural bridge to plug in VR rigs or Third-Person rigs cleanly.
    /// </summary>
    public class CameraManager : MonoBehaviour
    {
        public static CameraManager Instance { get; private set; }

        [Header("Active Camera Mode")]
        [SerializeField] private CameraMode _currentMode = CameraMode.Isometric;

        [Header("Camera Rig References")]
        [SerializeField] private IsometricCameraController _isometricCameraRig;
        [SerializeField] private GameObject _thirdPersonCameraRig;
        [SerializeField] private GameObject _vrOriginRig;

        public CameraMode CurrentMode => _currentMode;

        public event Action<CameraMode> OnCameraModeChanged;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        private void Start()
        {
            ApplyCameraMode(_currentMode);
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        /// <summary>
        /// Switches active camera rig between Isometric, ThirdPerson, and VR.
        /// </summary>
        public void SetCameraMode(CameraMode newMode)
        {
            if (_currentMode == newMode) return;

            _currentMode = newMode;
            ApplyCameraMode(_currentMode);
            OnCameraModeChanged?.Invoke(_currentMode);
        }

        private void ApplyCameraMode(CameraMode mode)
        {
            if (_isometricCameraRig != null)
                _isometricCameraRig.gameObject.SetActive(mode == CameraMode.Isometric);

            if (_thirdPersonCameraRig != null)
                _thirdPersonCameraRig.SetActive(mode == CameraMode.ThirdPerson);

            if (_vrOriginRig != null)
                _vrOriginRig.SetActive(mode == CameraMode.VR);

            Debug.Log($"[CameraManager] Switched to {mode} mode.");
        }
    }
}
