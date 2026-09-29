using System.Collections.Generic;
using UnityEngine;
using DisasterSim.Core;

namespace DisasterSim.Gameplay
{
    /// <summary>
    /// Factory for generating the default Flash Flood & Landslide educational scenario.
    /// Can be invoked at runtime or in the Editor to create the ScriptableObject asset.
    /// </summary>
    public static class FlashFloodScenarioFactory
    {
        public const string SCENARIO_ID = "SCN_FLASH_FLOOD_LANDSLIDE_01";
        public const string ROUTE_A_ID = "RouteA";
        public const string ROUTE_B_ID = "RouteB";
        public const string ROUTE_C_ID = "RouteC";

        public static ScenarioData CreateDefaultScenario()
        {
            ScenarioData data = ScriptableObject.CreateInstance<ScenarioData>();

            List<RouteConfig> routes = new List<RouteConfig>
            {
                new RouteConfig(
                    ROUTE_A_ID,
                    "Tuyến A: Đường qua cầu suối cạn",
                    RouteState.Open,
                    "Tuyến đường ngắn nhất nhưng cắt ngang dòng suối. Rất nguy hiểm khi thượng nguồn có mưa lớn sinh lũ quét."
                ),
                new RouteConfig(
                    ROUTE_B_ID,
                    "Tuyến B: Đường sườn đồi cao",
                    RouteState.Open,
                    "Tuyến đường dẫn lên cao điểm an toàn, xa lòng suối và vách taluy nguy hiểm. Tuyến sơ tán khuyến nghị."
                ),
                new RouteConfig(
                    ROUTE_C_ID,
                    "Tuyến C: Đường men chân dốc taluy",
                    RouteState.Open,
                    "Tuyến đường chạy dưới chân vách dốc đất mềm. Dễ bị cô lập khi sạt lở hoặc đá lăn xảy ra."
                )
            };

            List<ScenarioEventData> events = new List<ScenarioEventData>
            {
                new ScenarioEventData(
                    "EVT_00_START",
                    0f,
                    ScenarioEventType.Custom,
                    "",
                    "Mô phỏng bắt đầu: Tiếng sấm và mưa lớn kéo dài tại khu vực trường học."
                ),
                new ScenarioEventData(
                    "EVT_30_WARNING",
                    30f,
                    ScenarioEventType.WarningIssued,
                    "SchoolAlarm",
                    "Còi báo động xã vang lên! Cảnh báo cấp bách: Có nguy cơ xảy ra lũ quét và trượt lở đất trên địa bàn."
                ),
                new ScenarioEventData(
                    "EVT_90_RIVER_RAISED",
                    90f,
                    ScenarioEventType.RiverLevelRaised,
                    "FloodHazard_River",
                    "Dòng suối chuyển màu nâu đục ngầu, cuốn theo cành cây và mực nước bắt đầu dâng nhanh bất thường!",
                    1.2f
                ),
                new ScenarioEventData(
                    "EVT_150_BRIDGE_WARNING",
                    150f,
                    ScenarioEventType.BridgeWarning,
                    "FloodHazard_Bridge",
                    "Nước lũ tràn sát mép mặt cầu tạm ở Tuyến A! Đã có rung chấn nguy hiểm."
                ),
                new ScenarioEventData(
                    "EVT_210_BRIDGE_BLOCKED",
                    210f,
                    ScenarioEventType.BridgeBlocked,
                    ROUTE_A_ID,
                    "CẦU TẠM BỊ NƯỚC CUỐN SẬP! Tuyến A chính thức bị phong tỏa hoàn toàn. Tuyệt đối không qua suối!"
                ),
                new ScenarioEventData(
                    "EVT_270_ROCKFALL",
                    270f,
                    ScenarioEventType.RockfallStarted,
                    "LandslideHazard_Slope",
                    "Đá dăm và bùn đất bắt đầu rơi rải rác từ sườn dốc xuống mặt đường Tuyến C."
                ),
                new ScenarioEventData(
                    "EVT_330_SLOPE_WARNING",
                    330f,
                    ScenarioEventType.WarningIssued,
                    ROUTE_C_ID,
                    "Taluy dương xuất hiện vết nứt lớn kéo dài! Nước bùn phun ra từ kẽ đất ở Tuyến C."
                ),
                new ScenarioEventData(
                    "EVT_390_SLOPE_BLOCKED",
                    390f,
                    ScenarioEventType.LandslideStarted,
                    ROUTE_C_ID,
                    "SẠT LỞ ĐẤT ĐÃ XẢY RA! Hàng trăm khối đất đá đổ ụp xuống Tuyến C. Con đường bị vùi lấp hoàn toàn!"
                )
            };

            data.SetData(
                SCENARIO_ID,
                "Sơ tán khẩn cấp: Lũ quét & Sạt lở đất (Trường học vùng cao)",
                480f,
                events,
                routes
            );

            return data;
        }
    }
}
