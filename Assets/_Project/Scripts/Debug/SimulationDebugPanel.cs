using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// In-game Development Debug Panel allowing testers, designers, and educators
    /// to trigger hazards, manipulate routes, advance checkpoints, and fast-forward timeline
    /// without waiting for real-time timers. Available in Editor & Development Builds.
    /// </summary>
    public class SimulationDebugPanel : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private bool _showOnStartup = false;
        [SerializeField] private KeyCode _toggleKey = KeyCode.F1;

        private bool _isWindowVisible = false;
        private Rect _windowRect = new Rect(20, 80, 280, 420);

        private void Start()
        {
            _isWindowVisible = _showOnStartup || Debug.isDebugBuild;
        }

        private void Update()
        {
            if (Input.GetKeyDown(_toggleKey))
            {
                _isWindowVisible = !_isWindowVisible;
            }

            // Quick Hotkeys
            if (Input.GetKeyDown(KeyCode.F2)) TriggerFloodRising();
            if (Input.GetKeyDown(KeyCode.F3)) TriggerBridgeBlocked();
            if (Input.GetKeyDown(KeyCode.F4)) TriggerRockfall();
            if (Input.GetKeyDown(KeyCode.F5)) TriggerLandslideBlocked();
            if (Input.GetKeyDown(KeyCode.F6)) CompleteActiveCheckpoint();
            if (Input.GetKeyDown(KeyCode.F7)) FastForwardTimeline(30f);
            if (Input.GetKeyDown(KeyCode.F8)) ResetSimulation();
        }

        private void OnGUI()
        {
            if (!_isWindowVisible) return;

            GUI.backgroundColor = new Color(0.1f, 0.15f, 0.2f, 0.9f);
            _windowRect = GUI.Window(9999, _windowRect, DrawDebugWindow, "Bảng Điều Khiển Debug (F1)");
        }

        private void DrawDebugWindow(int windowId)
        {
            GUILayout.Space(6);
            GUILayout.Label($"Thời gian: {(ScenarioManager.Instance != null ? ScenarioManager.Instance.ElapsedTime : 0f):F1}s");

            GUILayout.Space(6);
            GUILayout.Label("--- THIÊN TAI (HAZARDS) ---");
            if (GUILayout.Button("F2: Nước Lũ Dâng (River Rising)"))
            {
                TriggerFloodRising();
            }

            if (GUILayout.Button("F3: Cầu Sập (Block Route A)"))
            {
                TriggerBridgeBlocked();
            }

            if (GUILayout.Button("F4: Đá Lăn (Rockfall Route C)"))
            {
                TriggerRockfall();
            }

            if (GUILayout.Button("F5: Sạt Lở (Block Route C)"))
            {
                TriggerLandslideBlocked();
            }

            GUILayout.Space(6);
            GUILayout.Label("--- ĐIỀU HƯỚNG & MỤC TIÊU ---");
            if (GUILayout.Button("F6: Hoàn thành Checkpoint hiện tại"))
            {
                CompleteActiveCheckpoint();
            }

            if (GUILayout.Button("F7: Tua nhanh +30 giây"))
            {
                FastForwardTimeline(30f);
            }

            if (GUILayout.Button("Tua nhanh +60 giây"))
            {
                FastForwardTimeline(60f);
            }

            GUILayout.Space(6);
            GUILayout.Label("--- HỆ THỐNG ---");
            if (GUILayout.Button("F8: Đặt lại kịch bản (Reset)"))
            {
                ResetSimulation();
            }

            if (GUILayout.Button("Đóng bảng điều khiển (F1)"))
            {
                _isWindowVisible = false;
            }

            GUI.DragWindow();
        }

        public void TriggerFloodRising()
        {
            FloodHazard flood = FindFirstObjectByType<FloodHazard>();
            if (flood != null)
            {
                flood.SetFloodState(FloodState.Rising, "Debug: Nước lũ thượng nguồn dâng nhanh");
            }
            else if (RouteManager.Instance != null)
            {
                RouteManager.Instance.SetRouteState("RouteA", RouteState.Warning, "Debug: Nguy cơ ngập cầu");
            }
        }

        public void TriggerBridgeBlocked()
        {
            FloodHazard flood = FindFirstObjectByType<FloodHazard>();
            if (flood != null)
            {
                flood.SetFloodState(FloodState.Blocked, "Debug: Cầu tạm bị nước lũ cuốn sập");
            }
            else if (RouteManager.Instance != null)
            {
                RouteManager.Instance.SetRouteState("RouteA", RouteState.Blocked, "Debug: Cầu tạm bị cuốn sập");
            }
        }

        public void TriggerRockfall()
        {
            LandslideHazard landslide = FindFirstObjectByType<LandslideHazard>();
            if (landslide != null)
            {
                landslide.SetLandslideState(LandslideState.Rockfall, "Debug: Đá lăn taluy dương");
            }
            else if (RouteManager.Instance != null)
            {
                RouteManager.Instance.SetRouteState("RouteC", RouteState.Warning, "Debug: Đá lăn sườn dốc");
            }
        }

        public void TriggerLandslideBlocked()
        {
            LandslideHazard landslide = FindFirstObjectByType<LandslideHazard>();
            if (landslide != null)
            {
                landslide.SetLandslideState(LandslideState.Blocked, "Debug: Sạt trượt đất vùi lấp đường");
            }
            else if (RouteManager.Instance != null)
            {
                RouteManager.Instance.SetRouteState("RouteC", RouteState.Blocked, "Debug: Đất đá vùi lấp đường");
            }
        }

        public void CompleteActiveCheckpoint()
        {
            if (CheckpointManager.Instance != null && CheckpointManager.Instance.CurrentActiveCheckpoint != null)
            {
                CheckpointManager.Instance.CompleteCheckpoint(CheckpointManager.Instance.CurrentActiveCheckpoint.CheckpointId);
            }
        }

        public void FastForwardTimeline(float seconds)
        {
            if (ScenarioManager.Instance != null)
            {
                ScenarioManager.Instance.JumpToTime(ScenarioManager.Instance.ElapsedTime + seconds);
            }
        }

        public void ResetSimulation()
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.RestartSimulation();
            }
        }
    }
}
