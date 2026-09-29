using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Abstract base implementation of IInteractable handling common focus callbacks and prompt text.
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public abstract class InteractableBase : MonoBehaviour, IInteractable
    {
        [Header("Interaction Configuration")]
        [SerializeField] private string _promptText = "Nhấn E để tương tác";
        [SerializeField] private bool _canInteract = true;
        [SerializeField] private bool _interactOnce = false;

        public virtual string InteractionPrompt => _promptText;
        public virtual bool CanInteract => _canInteract;

        public virtual void Interact(GameObject interactor)
        {
            if (!_canInteract) return;

            OnInteracted(interactor);

            if (_interactOnce)
            {
                _canInteract = false;
            }
        }

        protected abstract void OnInteracted(GameObject interactor);

        public virtual void OnFocus()
        {
            // Optional outline or highlight
        }

        public virtual void OnDefocus()
        {
            // Optional removal of highlight
        }

        public void SetInteractable(bool state)
        {
            _canInteract = state;
        }

        public void SetPromptText(string prompt)
        {
            _promptText = prompt;
        }
    }
}
