using UnityEngine;

namespace DisasterSim.Core
{
    /// <summary>
    /// Contract for objects that can be examined or interacted with by the player
    /// (e.g., NPCs, warning signs, hazard observation hotspots, safe assembly point).
    /// </summary>
    public interface IInteractable
    {
        /// <summary>
        /// Text shown on screen when the player focuses on this object (e.g. "Nhấn E để kiểm tra mực nước suối").
        /// </summary>
        string InteractionPrompt { get; }

        /// <summary>
        /// Whether this object is currently receptive to interaction.
        /// </summary>
        bool CanInteract { get; }

        /// <summary>
        /// Executed when the player presses the interact key/trigger while focused on this object.
        /// </summary>
        /// <param name="interactor">The GameObject that triggered the interaction.</param>
        void Interact(GameObject interactor);

        /// <summary>
        /// Called when the interactor enters focus range of this object.
        /// </summary>
        void OnFocus();

        /// <summary>
        /// Called when the interactor leaves focus range of this object.
        /// </summary>
        void OnDefocus();
    }
}
