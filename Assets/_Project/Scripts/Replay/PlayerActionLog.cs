using System;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Chronologically records all student decisions, hazard encounters, and milestones.
    /// Provides telemetry data used for debriefing, teacher evaluation reports, and future VR/3D replay systems.
    /// </summary>
    public class PlayerActionLog : MonoBehaviour
    {
        public static PlayerActionLog Instance { get; private set; }

        private readonly List<ActionLogEntry> _logEntries = new List<ActionLogEntry>();

        public IReadOnlyList<ActionLogEntry> Entries => _logEntries;

        public event Action<ActionLogEntry> OnActionRecorded;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        /// <summary>
        /// Appends an action or event timestamped according to scenario elapsed time.
        /// </summary>
        public void RecordAction(string action, string target = "", int scoreImpact = 0)
        {
            float timestamp = ScenarioManager.Instance != null ? ScenarioManager.Instance.ElapsedTime : Time.time;
            ActionLogEntry entry = new ActionLogEntry(timestamp, action, target, scoreImpact);
            _logEntries.Add(entry);

            Debug.Log($"[ActionLog] {entry}");
            OnActionRecorded?.Invoke(entry);
        }

        /// <summary>
        /// Clears all recorded entries.
        /// </summary>
        public void ClearLog()
        {
            _logEntries.Clear();
        }

        /// <summary>
        /// Formats a complete student debriefing report for teachers and pedagogical review.
        /// </summary>
        public string GenerateTeacherReport(string studentName = "Học sinh", int totalScore = 0)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("=================================================");
            sb.AppendLine("BÁO CÁO KẾT QUẢ DIỄN TẬP SƠ TÁN PHÒNG CHỐNG THIÊN TAI");
            sb.AppendLine("=================================================");
            sb.AppendLine($"Đối tượng: {studentName}");
            sb.AppendLine($"Thời gian xuất báo cáo: {DateTime.Now:dd/MM/yyyy HH:mm:ss}");
            sb.AppendLine($"Điểm tổng kết: {totalScore} / 100 điểm");
            sb.AppendLine("-------------------------------------------------");
            sb.AppendLine("NHẬT KÝ HÀNH ĐỘNG CHI TIẾT (ACTION LOG):");
            sb.AppendLine("-------------------------------------------------");

            for (int i = 0; i < _logEntries.Count; i++)
            {
                sb.AppendLine($"{i + 1:D2}. {_logEntries[i]}");
            }

            sb.AppendLine("-------------------------------------------------");
            sb.AppendLine("ĐÁNH GIÁ NĂNG LỰC:");
            if (totalScore >= 85)
            {
                sb.AppendLine("Xếp loại: Xuất sắc - Học sinh nắm rất vững kỹ năng nhận biết và sơ tán an toàn.");
            }
            else if (totalScore >= 65)
            {
                sb.AppendLine("Xếp loại: Đạt - Học sinh cơ bản biết cách chọn tuyến, cần lưu ý thêm quan sát dấu hiệu.");
            }
            else
            {
                sb.AppendLine("Xếp loại: Cần rèn luyện lại - Học sinh còn mạo hiểm hoặc chậm trễ khi có cảnh báo thiên tai.");
            }
            sb.AppendLine("=================================================");

            return sb.ToString();
        }
    }
}
