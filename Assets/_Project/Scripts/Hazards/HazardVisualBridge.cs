using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Presentation layer bridge that reacts to hazard state changes and updates visual representations
    /// (e.g. material tint, water elevation, debris blockades, warning markers).
    /// Keeps gameplay logic completely decoupled from rendering/visual components.
    /// </summary>
    public class HazardVisualBridge : MonoBehaviour
    {
        [Header("Target Hazard Binding")]
        [SerializeField] private HazardBase _hazard;

        [Header("Visual Feedback Elements")]
        [SerializeField] private Renderer _targetRenderer;
        [SerializeField] private Transform _visualTransformToElevate;
        [SerializeField] private Vector3 _elevationOffset = new Vector3(0f, 1.5f, 0f);
        [SerializeField] private GameObject _warningVisualObject;
        [SerializeField] private GameObject _dangerVisualObject;
        [SerializeField] private GameObject _blockageVisualObject;

        [Header("Color Palette")]
        [SerializeField] private Color _inactiveColor = new Color(0.2f, 0.6f, 0.9f);
        [SerializeField] private Color _warningColor = new Color(0.95f, 0.75f, 0.1f);
        [SerializeField] private Color _dangerousColor = new Color(0.95f, 0.4f, 0.1f);
        [SerializeField] private Color _blockedColor = new Color(0.85f, 0.15f, 0.15f);

        private Vector3 _initialLocalPosition;
        private MaterialPropertyBlock _propBlock;

        private void Awake()
        {
            if (_hazard == null)
            {
                _hazard = GetComponent<HazardBase>();
            }

            if (_visualTransformToElevate != null)
            {
                _initialLocalPosition = _visualTransformToElevate.localPosition;
            }

            _propBlock = new MaterialPropertyBlock();
        }

        private void OnEnable()
        {
            if (_hazard != null)
            {
                _hazard.OnHazardStateChanged += HandleHazardStateChanged;
                UpdateVisuals(_hazard.CurrentState);
            }
        }

        private void OnDisable()
        {
            if (_hazard != null)
            {
                _hazard.OnHazardStateChanged -= HandleHazardStateChanged;
            }
        }

        private void HandleHazardStateChanged(IHazard hazard, HazardState newState)
        {
            UpdateVisuals(newState);
        }

        public void UpdateVisuals(HazardState state)
        {
            // Toggle auxiliary visual cues
            if (_warningVisualObject != null)
                _warningVisualObject.SetActive(state == HazardState.Warning);

            if (_dangerVisualObject != null)
                _dangerVisualObject.SetActive(state == HazardState.Dangerous);

            if (_blockageVisualObject != null)
                _blockageVisualObject.SetActive(state == HazardState.Blocked);

            // Update renderer color via MaterialPropertyBlock to prevent runtime material instancing leaks
            if (_targetRenderer != null)
            {
                Color targetColor = state switch
                {
                    HazardState.Inactive => _inactiveColor,
                    HazardState.Warning => _warningColor,
                    HazardState.Dangerous => _dangerousColor,
                    HazardState.Blocked => _blockedColor,
                    _ => _inactiveColor
                };

                _targetRenderer.GetPropertyBlock(_propBlock);
                _propBlock.SetColor("_BaseColor", targetColor);
                _propBlock.SetColor("_Color", targetColor);
                _targetRenderer.SetPropertyBlock(_propBlock);
            }

            // Elevation offset (useful for rising flood plane or falling debris)
            if (_visualTransformToElevate != null)
            {
                float factor = state switch
                {
                    HazardState.Inactive => 0.0f,
                    HazardState.Warning => 0.35f,
                    HazardState.Dangerous => 0.75f,
                    HazardState.Blocked => 1.0f,
                    _ => 0f
                };

                _visualTransformToElevate.localPosition = _initialLocalPosition + (_elevationOffset * factor);
            }
        }
    }
}
