using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Presentation bridge that displays visual status markers (e.g., barrier lights, road signs)
    /// corresponding to the RouteState of a given route.
    /// </summary>
    public class RouteVisualBridge : MonoBehaviour
    {
        [Header("Route Binding")]
        [SerializeField] private string _boundRouteId = "RouteA";

        [Header("Visual Indicators")]
        [SerializeField] private GameObject _openVisual;
        [SerializeField] private GameObject _warningVisual;
        [SerializeField] private GameObject _blockedVisual;

        [Header("Material Color Tuning")]
        [SerializeField] private Renderer _indicatorRenderer;
        [SerializeField] private Color _openColor = new Color(0.2f, 0.8f, 0.2f);
        [SerializeField] private Color _warningColor = new Color(0.95f, 0.8f, 0.1f);
        [SerializeField] private Color _blockedColor = new Color(0.9f, 0.1f, 0.1f);

        private MaterialPropertyBlock _propBlock;

        private void Awake()
        {
            _propBlock = new MaterialPropertyBlock();
        }

        private void Start()
        {
            if (RouteManager.Instance != null)
            {
                RouteManager.Instance.OnRouteStateChanged += HandleRouteChanged;
                RouteData current = RouteManager.Instance.GetRoute(_boundRouteId);
                if (current != null)
                {
                    UpdateVisuals(current.CurrentState);
                }
            }
        }

        private void OnDestroy()
        {
            if (RouteManager.Instance != null)
            {
                RouteManager.Instance.OnRouteStateChanged -= HandleRouteChanged;
            }
        }

        private void HandleRouteChanged(string routeId, RouteState newState, string reason)
        {
            if (string.Equals(routeId, _boundRouteId, System.StringComparison.OrdinalIgnoreCase))
            {
                UpdateVisuals(newState);
            }
        }

        public void UpdateVisuals(RouteState state)
        {
            if (_openVisual != null) _openVisual.SetActive(state == RouteState.Open);
            if (_warningVisual != null) _warningVisual.SetActive(state == RouteState.Warning);
            if (_blockedVisual != null) _blockedVisual.SetActive(state == RouteState.Blocked);

            if (_indicatorRenderer != null)
            {
                Color target = state switch
                {
                    RouteState.Open => _openColor,
                    RouteState.Warning => _warningColor,
                    RouteState.Blocked => _blockedColor,
                    _ => _openColor
                };

                _indicatorRenderer.GetPropertyBlock(_propBlock);
                _propBlock.SetColor("_BaseColor", target);
                _propBlock.SetColor("_Color", target);
                _indicatorRenderer.SetPropertyBlock(_propBlock);
            }
        }
    }
}
