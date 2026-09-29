using UnityEngine;
using UnityEngine.AI;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Student NPC classmate who is hesitant/injured and requires peer assistance (CP5 - Hỗ trợ bạn).
    /// Awards GroupSafety score (+15 pts) upon interaction and follows the player to safety.
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public class InteractableNpcFriend : MonoBehaviour, IInteractable
    {
        [Header("NPC Data")]
        [SerializeField] private string _studentName = "Bạn Minh (Học sinh lớp 7)";
        [SerializeField] private string _helpPrompt = "Nhấn E để hỗ trợ bạn Minh sơ tán";
        [SerializeField] private int _scoreReward = 15;

        [Header("State")]
        [SerializeField] private bool _hasBeenHelped = false;
        [SerializeField] private Transform _playerFollowTarget;
        [SerializeField] private float _followDistance = 2.5f;

        private NavMeshAgent _agent;
        private Outline _outline; // optional visual outline indicator

        public string InteractionPrompt => _hasBeenHelped ? $"{_studentName} đang đi theo bạn lên cao điểm" : _helpPrompt;
        public bool CanInteract => !_hasBeenHelped;

        private void Awake()
        {
            _agent = GetComponent<NavMeshAgent>();
        }

        private void Update()
        {
            if (_hasBeenHelped && _playerFollowTarget != null && _agent != null && _agent.isOnNavMesh)
            {
                float dist = Vector3.Distance(transform.position, _playerFollowTarget.position);
                if (dist > _followDistance)
                {
                    _agent.SetDestination(_playerFollowTarget.position);
                }
            }
        }

        public void Interact(GameObject interactor)
        {
            if (_hasBeenHelped) return;

            _hasBeenHelped = true;
            _playerFollowTarget = interactor != null ? interactor.transform : null;

            Debug.Log($"[InteractableNpcFriend] Player helped {_studentName}!");

            // 1. Award GroupSafety score
            if (ScoreManager.Instance != null)
            {
                ScoreManager.Instance.Add(
                    ScoreCategory.GroupSafety,
                    _scoreReward,
                    $"Hỗ trợ bạn {_studentName} kịp thời cùng sơ tán"
                );
            }

            // 2. Complete Checkpoint CP5
            if (CheckpointManager.Instance != null)
            {
                CheckpointManager.Instance.CompleteCheckpoint("CP5");
            }

            // 3. Record in telemetry action log
            if (PlayerActionLog.Instance != null)
            {
                PlayerActionLog.Instance.RecordAction(
                    $"Hỗ trợ bạn cùng lớp: {_studentName}",
                    gameObject.name,
                    _scoreReward
                );
            }
        }

        public void OnFocus()
        {
            // Visual highlight hook
        }

        public void OnDefocus()
        {
            // Visual unhighlight hook
        }
    }
}
