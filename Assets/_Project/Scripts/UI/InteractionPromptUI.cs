using UnityEngine;
using TMPro;
using DisasterSim.Gameplay;

namespace DisasterSim.UI
{
    /// <summary>
    /// Displays floating or on-screen prompt when player approaches interactable objects
    /// (e.g. "Nhấn E để tương tác").
    /// </summary>
    public class InteractionPromptUI : MonoBehaviour
    {
        [Header("UI Binding")]
        [SerializeField] private GameObject _promptContainer;
        [SerializeField] private TextMeshProUGUI _promptLabel;

        private Interactor _interactor;

        private void Start()
        {
            _interactor = FindFirstObjectByType<Interactor>();
            if (_interactor != null)
            {
                _interactor.OnPromptChanged += HandlePromptChanged;
            }

            if (_promptContainer != null)
            {
                _promptContainer.SetActive(false);
            }
        }

        private void OnDestroy()
        {
            if (_interactor != null)
            {
                _interactor.OnPromptChanged -= HandlePromptChanged;
            }
        }

        private void HandlePromptChanged(string promptText, bool isVisible)
        {
            if (_promptContainer != null)
            {
                _promptContainer.SetActive(isVisible);
            }

            if (_promptLabel != null && isVisible)
            {
                _promptLabel.text = promptText;
            }
        }
    }
}
