using System;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Attached to the Player. Detects nearby IInteractable objects via spatial queries,
    /// manages focus state, and delegates interaction triggers without coupling to specific object types.
    /// </summary>
    public class Interactor : MonoBehaviour
    {
        [Header("Detection Parameters")]
        [SerializeField] private float _interactionRadius = 2.5f;
        [SerializeField] private LayerMask _interactableLayers = ~0;
        [SerializeField] private Vector3 _sensorOffset = new Vector3(0f, 0.5f, 0.5f);

        private IPlayerInput _playerInput;
        private IInteractable _focusedInteractable;
        private readonly Collider[] _hitBuffer = new Collider[16];

        public IInteractable CurrentFocused => _focusedInteractable;

        public event Action<IInteractable> OnFocused;
        public event Action OnUnfocused;
        public event Action<string, bool> OnPromptChanged; // prompt, isVisible

        private void Awake()
        {
            _playerInput = GetComponent<IPlayerInput>();
        }

        private void Start()
        {
            if (_playerInput == null)
            {
                PlayerController pc = GetComponent<PlayerController>();
                if (pc != null)
                {
                    _playerInput = pc.PlayerInput;
                }
            }
        }

        private void Update()
        {
            ScanForInteractables();
            HandleInteractionTrigger();
        }

        private void ScanForInteractables()
        {
            Vector3 center = transform.TransformPoint(_sensorOffset);
            int count = Physics.OverlapSphereNonAlloc(center, _interactionRadius, _hitBuffer, _interactableLayers, QueryTriggerInteraction.Collide);

            IInteractable closest = null;
            float closestDistanceSqr = float.MaxValue;

            for (int i = 0; i < count; i++)
            {
                Collider col = _hitBuffer[i];
                if (col.gameObject == gameObject) continue;

                IInteractable interactable = col.GetComponent<IInteractable>();
                if (interactable == null)
                {
                    interactable = col.GetComponentInParent<IInteractable>();
                }

                if (interactable != null && interactable.CanInteract)
                {
                    float distSqr = (col.transform.position - transform.position).sqrMagnitude;
                    if (distSqr < closestDistanceSqr)
                    {
                        closestDistanceSqr = distSqr;
                        closest = interactable;
                    }
                }
            }

            // Update focus
            if (closest != _focusedInteractable)
            {
                if (_focusedInteractable != null)
                {
                    _focusedInteractable.OnDefocus();
                    OnUnfocused?.Invoke();
                }

                _focusedInteractable = closest;

                if (_focusedInteractable != null)
                {
                    _focusedInteractable.OnFocus();
                    OnFocused?.Invoke(_focusedInteractable);
                    OnPromptChanged?.Invoke(_focusedInteractable.InteractionPrompt, true);
                }
                else
                {
                    OnPromptChanged?.Invoke(string.Empty, false);
                }
            }
        }

        private void HandleInteractionTrigger()
        {
            if (_playerInput == null || _focusedInteractable == null) return;

            if (_playerInput.InteractTriggered)
            {
                _focusedInteractable.Interact(gameObject);

                // Refresh prompt after interaction
                if (_focusedInteractable.CanInteract)
                {
                    OnPromptChanged?.Invoke(_focusedInteractable.InteractionPrompt, true);
                }
                else
                {
                    _focusedInteractable.OnDefocus();
                    _focusedInteractable = null;
                    OnUnfocused?.Invoke();
                    OnPromptChanged?.Invoke(string.Empty, false);
                }
            }
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = new Color(0.2f, 0.8f, 1f, 0.35f);
            Vector3 center = transform.TransformPoint(_sensorOffset);
            Gizmos.DrawWireSphere(center, _interactionRadius);
        }
    }
}
