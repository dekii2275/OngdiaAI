using System;
using System.Collections.Generic;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Coordinates the educational checkpoint sequence from school evacuation to safe assembly.
    /// Manages completion states, awards category scores, and records telemetry logs.
    /// </summary>
    public class CheckpointManager : MonoBehaviour, IScenarioEventReceiver
    {
        public static CheckpointManager Instance { get; private set; }

        [Header("Checkpoints Sequence")]
        [SerializeField] private List<CheckpointData> _checkpoints = new List<CheckpointData>();

        private readonly Dictionary<string, CheckpointData> _checkpointMap = new Dictionary<string, CheckpointData>(StringComparer.OrdinalIgnoreCase);
        private int _currentCheckpointIndex = 0;

        public IReadOnlyList<CheckpointData> Checkpoints => _checkpoints;
        public CheckpointData CurrentActiveCheckpoint => (_currentCheckpointIndex >= 0 && _currentCheckpointIndex < _checkpoints.Count) ? _checkpoints[_currentCheckpointIndex] : null;

        public event Action<CheckpointData> OnCheckpointCompleted;
        public event Action<CheckpointData> OnActiveCheckpointChanged;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            InitializeCheckpoints();
        }

        private void Start()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.RegisterReceiver(this);
            }

            if (_checkpoints.Count > 0)
            {
                OnActiveCheckpointChanged?.Invoke(_checkpoints[0]);
            }
        }

        private void OnDestroy()
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.UnregisterReceiver(this);
            }

            if (Instance == this)
            {
                Instance = null;
            }
        }

        private void InitializeCheckpoints()
        {
            _checkpointMap.Clear();

            // Setup default canonical 8 checkpoints if list is empty
            if (_checkpoints.Count == 0)
            {
                _checkpoints = new List<CheckpointData>
                {
                    new CheckpointData("CP0", "Nhận cảnh báo", "Lắng nghe hiệu lệnh còi báo động và thông báo sơ tán khẩn cấp từ ban giám hiệu.", 10, ScoreCategory.ReactionTime, CheckpointTriggerType.ScenarioEvent),
                    new CheckpointData("CP1", "Rời trường", "Nhanh chóng di chuyển có trật tự ra khỏi cổng trường theo hướng dẫn.", 10, ScoreCategory.ReactionTime, CheckpointTriggerType.VolumeTrigger),
                    new CheckpointData("CP2", "Nhận biết dấu hiệu nguy hiểm", "Quan sát dòng suối đục ngầu và tiếng gầm từ đầu nguồn để nhận biết lũ quét.", 15, ScoreCategory.HazardAwareness, CheckpointTriggerType.VolumeTrigger),
                    new CheckpointData("CP3", "Chọn tuyến sơ tán", "Lựa chọn tuyến đường đi qua ngã ba đường đồi thay vì mạo hiểm đi qua cầu suối cạn.", 10, ScoreCategory.RouteChoice, CheckpointTriggerType.VolumeTrigger),
                    new CheckpointData("CP4", "Xử lý khi tuyến thay đổi", "Phát hiện tuyến đường sạt lở hoặc cầu ngập, lập tức chuyển hướng sang tuyến đồi cao.", 15, ScoreCategory.RouteChoice, CheckpointTriggerType.VolumeTrigger),
                    new CheckpointData("CP5", "Hỗ trợ bạn", "Giúp đỡ bạn học sinh đang bị trẹo chân hoặc hoảng sợ cùng tiếp tục di chuyển.", 15, ScoreCategory.GroupSafety, CheckpointTriggerType.Interaction),
                    new CheckpointData("CP6", "Ngã rẽ cuối", "Kiểm tra taluy dương và sườn dốc trước khi vượt qua đoạn dốc cuối cùng.", 10, ScoreCategory.HazardAwareness, CheckpointTriggerType.VolumeTrigger),
                    new CheckpointData("CP7", "Điểm tập kết", "Có mặt tại Điểm sơ tán an toàn trên đỉnh đồi, tập hợp điểm danh cùng thầy cô.", 15, ScoreCategory.EvacuationCompletion, CheckpointTriggerType.VolumeTrigger)
                };
            }

            for (int i = 0; i < _checkpoints.Count; i++)
            {
                CheckpointData cp = _checkpoints[i];
                if (cp != null && !string.IsNullOrEmpty(cp.CheckpointId))
                {
                    _checkpointMap[cp.CheckpointId] = cp;
                }
            }
        }

        public CheckpointData GetCheckpoint(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            _checkpointMap.TryGetValue(id, out CheckpointData cp);
            return cp;
        }

        public bool IsCompleted(string id)
        {
            CheckpointData cp = GetCheckpoint(id);
            return cp != null && cp.IsCompleted;
        }

        /// <summary>
        /// Marks a checkpoint as completed, awards score, and updates active objective.
        /// </summary>
        public bool CompleteCheckpoint(string id)
        {
            CheckpointData cp = GetCheckpoint(id);
            if (cp == null)
            {
                Debug.LogWarning($"[CheckpointManager] Checkpoint '{id}' not found!");
                return false;
            }

            if (cp.IsCompleted) return false;

            cp.IsCompleted = true;
            cp.CompletedAtTimestamp = Time.time;

            // 1. Award score
            if (ScoreManager.Instance != null && cp.ScoreValue > 0)
            {
                ScoreManager.Instance.Add(cp.Category, cp.ScoreValue, $"Hoàn thành mục tiêu: {cp.CheckpointName}");
            }

            // 2. Action log
            if (PlayerActionLog.Instance != null)
            {
                PlayerActionLog.Instance.RecordAction($"Đạt mốc: {cp.CheckpointName}", cp.CheckpointId, cp.ScoreValue);
            }

            Debug.Log($"[CheckpointManager] Checkpoint '{id}' completed: {cp.CheckpointName} (+{cp.ScoreValue} pts -> {cp.Category})");

            OnCheckpointCompleted?.Invoke(cp);

            // Advance active checkpoint index
            AdvanceActiveCheckpoint();

            // If final checkpoint (CP7), complete simulation
            if (string.Equals(id, "CP7", StringComparison.OrdinalIgnoreCase))
            {
                if (GameManager.Instance != null)
                {
                    GameManager.Instance.CompleteGame("Chúc mừng bạn đã hoàn thành xuất sắc đợt sơ tán an toàn!");
                }
            }

            return true;
        }

        private void AdvanceActiveCheckpoint()
        {
            while (_currentCheckpointIndex < _checkpoints.Count && _checkpoints[_currentCheckpointIndex].IsCompleted)
            {
                _currentCheckpointIndex++;
            }

            if (_currentCheckpointIndex < _checkpoints.Count)
            {
                OnActiveCheckpointChanged?.Invoke(_checkpoints[_currentCheckpointIndex]);
            }
            else
            {
                OnActiveCheckpointChanged?.Invoke(null);
            }
        }

        public void OnScenarioEventReceived(ScenarioEventData eventData)
        {
            if (eventData.EventType == ScenarioEventType.WarningIssued)
            {
                CompleteCheckpoint("CP0");
            }
        }
    }
}
