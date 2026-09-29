using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Scene trigger volume placed along evacuation corridors to mark checkpoint completions
    /// (e.g. leaving school gate CP1, approaching river CP2, reaching Safe Zone CP7).
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public class CheckpointTrigger : MonoBehaviour
    {
        [Header("Checkpoint Target")]
        [SerializeField] private string _checkpointId = "CP1";
        [SerializeField] private bool _triggerOnce = true;
        [SerializeField] private Color _gizmoColor = new Color(0.2f, 0.9f, 0.3f, 0.4f);

        private Collider _collider;
        private bool _isTriggered = false;

        public string CheckpointId => _checkpointId;

        private void Awake()
        {
            _collider = GetComponent<Collider>();
            if (_collider != null)
            {
                _collider.isTrigger = true;
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            if (_isTriggered && _triggerOnce) return;

            // Check if entrant is the player
            if (other.CompareTag("Player") || other.GetComponent<PlayerController>() != null)
            {
                if (CheckpointManager.Instance != null)
                {
                    bool completed = CheckpointManager.Instance.CompleteCheckpoint(_checkpointId);
                    if (completed)
                    {
                        _isTriggered = true;
                        if (_triggerOnce)
                        {
                            _collider.enabled = false;
                        }
                    }
                }
            }
        }

        private void OnDrawGizmos()
        {
            Gizmos.color = _gizmoColor;
            Collider col = GetComponent<Collider>();
            if (col is BoxCollider box)
            {
                Gizmos.matrix = transform.localToWorldMatrix;
                Gizmos.DrawCube(box.center, box.size);
                Gizmos.DrawWireCube(box.center, box.size);
            }
            else if (col is SphereCollider sphere)
            {
                Gizmos.DrawSphere(transform.TransformPoint(sphere.center), sphere.radius);
            }
            else
            {
                Gizmos.DrawCube(transform.position, Vector3.one * 2f);
            }
        }
    }
}
