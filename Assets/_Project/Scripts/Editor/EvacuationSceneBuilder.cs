#if UNITY_EDITOR
using System.IO;
using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine.SceneManagement;
using UnityEngine.AI;
using UnityEngine.UI;
using TMPro;
using DisasterSim.Core;
using DisasterSim.Gameplay;
using DisasterSim.UI;

namespace DisasterSim.Editor
{
    /// <summary>
    /// Editor automation tool to construct the playable blockout scene and default scenario assets
    /// with one click from Unity Editor menus.
    /// </summary>
    public static class EvacuationSceneBuilder
    {
        private const string SCENE_DIR = "Assets/_Project/Scenes/Gameplay";
        private const string SCENE_PATH = "Assets/_Project/Scenes/Gameplay/EvacuationPrototype.unity";
        private const string SCENARIO_DATA_DIR = "Assets/_Project/Data/Scenarios";
        private const string SCENARIO_DATA_PATH = "Assets/_Project/Data/Scenarios/FlashFloodEvacuationScenario.asset";

        [MenuItem("Tools/Disaster Sim/1. Create Default Scenario Asset", false, 1)]
        public static ScenarioData CreateScenarioAsset()
        {
            if (!Directory.Exists(SCENARIO_DATA_DIR))
            {
                Directory.CreateDirectory(SCENARIO_DATA_DIR);
            }

            ScenarioData existing = AssetDatabase.LoadAssetAtPath<ScenarioData>(SCENARIO_DATA_PATH);
            if (existing != null)
            {
                Debug.Log($"[EvacuationSceneBuilder] Scenario asset already exists at: {SCENARIO_DATA_PATH}");
                return existing;
            }

            ScenarioData newScenario = FlashFloodScenarioFactory.CreateDefaultScenario();
            AssetDatabase.CreateAsset(newScenario, SCENARIO_DATA_PATH);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log($"[EvacuationSceneBuilder] Successfully generated default scenario at: {SCENARIO_DATA_PATH}");
            return newScenario;
        }

        [MenuItem("Tools/Disaster Sim/2. Generate Evacuation Prototype Scene", false, 2)]
        public static void GeneratePrototypeScene()
        {
            ScenarioData scenarioAsset = CreateScenarioAsset();

            if (!Directory.Exists(SCENE_DIR))
            {
                Directory.CreateDirectory(SCENE_DIR);
            }

            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            scene.name = "EvacuationPrototype";

            // 1. Lighting & Environment Root
            GameObject envRoot = new GameObject("--- ENVIRONMENT ---");

            GameObject dirLight = new GameObject("Directional Light");
            dirLight.transform.parent = envRoot.transform;
            Light lightComp = dirLight.AddComponent<Light>();
            lightComp.type = LightType.Directional;
            lightComp.intensity = 1.1f;
            dirLight.transform.rotation = Quaternion.Euler(50f, -30f, 0f);

            // Ground plane (100x100m)
            GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Ground_Terrain";
            ground.transform.parent = envRoot.transform;
            ground.transform.position = Vector3.zero;
            ground.transform.localScale = new Vector3(12f, 1f, 12f); // 120m x 120m

            // School complex (Starting Zone)
            GameObject schoolRoot = new GameObject("School_Complex");
            schoolRoot.transform.parent = envRoot.transform;
            schoolRoot.transform.position = new Vector3(0f, 0f, -35f);

            GameObject schoolBuilding = GameObject.CreatePrimitive(PrimitiveType.Cube);
            schoolBuilding.name = "School_Building";
            schoolBuilding.transform.parent = schoolRoot.transform;
            schoolBuilding.transform.localPosition = new Vector3(0f, 4f, -10f);
            schoolBuilding.transform.localScale = new Vector3(25f, 8f, 12f);

            GameObject schoolGate = GameObject.CreatePrimitive(PrimitiveType.Cube);
            schoolGate.name = "School_Gate_Left";
            schoolGate.transform.parent = schoolRoot.transform;
            schoolGate.transform.localPosition = new Vector3(-6f, 2f, 8f);
            schoolGate.transform.localScale = new Vector3(1.5f, 4f, 1.5f);

            GameObject schoolGateR = GameObject.CreatePrimitive(PrimitiveType.Cube);
            schoolGateR.name = "School_Gate_Right";
            schoolGateR.transform.parent = schoolRoot.transform;
            schoolGateR.transform.localPosition = new Vector3(6f, 2f, 8f);
            schoolGateR.transform.localScale = new Vector3(1.5f, 4f, 1.5f);

            // Routes & Landscape
            // Route A: River and Bridge (West side)
            GameObject routeARoot = new GameObject("RouteA_LowRiverBridge");
            routeARoot.transform.parent = envRoot.transform;

            GameObject river = GameObject.CreatePrimitive(PrimitiveType.Cube);
            river.name = "River_Stream";
            river.transform.parent = routeARoot.transform;
            river.transform.position = new Vector3(-25f, -0.3f, 0f);
            river.transform.localScale = new Vector3(12f, 0.6f, 80f);

            GameObject bridge = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bridge.name = "Bridge_Temporary";
            bridge.transform.parent = routeARoot.transform;
            bridge.transform.position = new Vector3(-25f, 0.4f, 0f);
            bridge.transform.localScale = new Vector3(14f, 0.8f, 6f);

            // Route C: Mountain Slope & Landslide (East side)
            GameObject routeCRoot = new GameObject("RouteC_SlopeLandslide");
            routeCRoot.transform.parent = envRoot.transform;

            GameObject mountainSlope = GameObject.CreatePrimitive(PrimitiveType.Cube);
            mountainSlope.name = "Mountain_Hillside_Slope";
            mountainSlope.transform.parent = routeCRoot.transform;
            mountainSlope.transform.position = new Vector3(35f, 6f, 0f);
            mountainSlope.transform.localScale = new Vector3(20f, 14f, 75f);
            mountainSlope.transform.rotation = Quaternion.Euler(15f, 0f, -25f);

            // Route B: High Road (Center - leads directly to hilltop safe zone)
            GameObject routeBRoot = new GameObject("RouteB_HighSafeRoad");
            routeBRoot.transform.parent = envRoot.transform;

            GameObject highPlateau = GameObject.CreatePrimitive(PrimitiveType.Cube);
            highPlateau.name = "High_Plateau_Road";
            highPlateau.transform.parent = routeBRoot.transform;
            highPlateau.transform.position = new Vector3(0f, 2f, 15f);
            highPlateau.transform.localScale = new Vector3(10f, 4f, 35f);

            // Safe Assembly Point (Destination on high plateau)
            GameObject safeZoneRoot = new GameObject("Safe_Assembly_Point");
            safeZoneRoot.transform.parent = envRoot.transform;
            safeZoneRoot.transform.position = new Vector3(0f, 4f, 45f);

            GameObject communityHouse = GameObject.CreatePrimitive(PrimitiveType.Cube);
            communityHouse.name = "Community_House_Shelter";
            communityHouse.transform.parent = safeZoneRoot.transform;
            communityHouse.transform.localPosition = new Vector3(0f, 2.5f, 6f);
            communityHouse.transform.localScale = new Vector3(15f, 5f, 10f);

            GameObject assemblySign = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            assemblySign.name = "Assembly_Sign_Post";
            assemblySign.transform.parent = safeZoneRoot.transform;
            assemblySign.transform.localPosition = new Vector3(0f, 1.5f, 0f);
            assemblySign.transform.localScale = new Vector3(0.5f, 3f, 0.5f);
            assemblySign.AddComponent<InteractableAssemblyPoint>();

            // 2. Hazards
            GameObject hazardsRoot = new GameObject("--- HAZARDS ---");

            GameObject floodObj = new GameObject("FloodHazard_River");
            floodObj.transform.parent = hazardsRoot.transform;
            floodObj.transform.position = new Vector3(-25f, 0.5f, 0f);
            FloodHazard floodHazard = floodObj.AddComponent<FloodHazard>();
            HazardVisualBridge floodVisual = floodObj.AddComponent<HazardVisualBridge>();

            GameObject landslideObj = new GameObject("LandslideHazard_Slope");
            landslideObj.transform.parent = hazardsRoot.transform;
            landslideObj.transform.position = new Vector3(25f, 2f, 0f);
            LandslideHazard landslideHazard = landslideObj.AddComponent<LandslideHazard>();
            HazardVisualBridge landslideVisual = landslideObj.AddComponent<HazardVisualBridge>();

            // 3. Dynamic Obstacles
            GameObject obstaclesRoot = new GameObject("--- DYNAMIC OBSTACLES ---");

            GameObject bridgeObstacleObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            bridgeObstacleObj.name = "Obstacle_Bridge_RouteA";
            bridgeObstacleObj.transform.parent = obstaclesRoot.transform;
            bridgeObstacleObj.transform.position = new Vector3(-25f, 1f, 0f);
            bridgeObstacleObj.transform.localScale = new Vector3(8f, 2f, 4f);
            DynamicRouteObstacle bridgeObstacle = bridgeObstacleObj.AddComponent<DynamicRouteObstacle>();

            GameObject slopeObstacleObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            slopeObstacleObj.name = "Obstacle_Landslide_RouteC";
            slopeObstacleObj.transform.parent = obstaclesRoot.transform;
            slopeObstacleObj.transform.position = new Vector3(22f, 1f, 0f);
            slopeObstacleObj.transform.localScale = new Vector3(8f, 2.5f, 6f);
            DynamicRouteObstacle slopeObstacle = slopeObstacleObj.AddComponent<DynamicRouteObstacle>();

            // 4. Checkpoints
            GameObject cpRoot = new GameObject("--- CHECKPOINTS ---");

            CreateTriggerZone(cpRoot.transform, "CP1_GateTrigger", "CP1", new Vector3(0f, 1.5f, -27f), new Vector3(14f, 3f, 4f));
            CreateTriggerZone(cpRoot.transform, "CP2_RiverWarningTrigger", "CP2", new Vector3(-15f, 1.5f, -10f), new Vector3(8f, 3f, 8f));
            CreateTriggerZone(cpRoot.transform, "CP3_RouteForkTrigger", "CP3", new Vector3(0f, 1.5f, -12f), new Vector3(16f, 3f, 5f));
            CreateTriggerZone(cpRoot.transform, "CP4_RerouteTrigger", "CP4", new Vector3(0f, 2.5f, 5f), new Vector3(12f, 3f, 6f));
            CreateTriggerZone(cpRoot.transform, "CP6_FinalAscentTrigger", "CP6", new Vector3(0f, 3.5f, 30f), new Vector3(12f, 3f, 6f));
            CreateTriggerZone(cpRoot.transform, "CP7_SafeZoneTrigger", "CP7", new Vector3(0f, 4.5f, 45f), new Vector3(16f, 4f, 16f));

            // Interactable Hotspot & Signboards
            GameObject riverHotspot = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            riverHotspot.name = "Hotspot_MuddyRiver_CP2";
            riverHotspot.transform.parent = cpRoot.transform;
            riverHotspot.transform.position = new Vector3(-18f, 1f, -5f);
            riverHotspot.transform.localScale = new Vector3(1f, 1.8f, 1f);
            riverHotspot.AddComponent<InteractableHazardHotspot>();

            GameObject warningSign = GameObject.CreatePrimitive(PrimitiveType.Cube);
            warningSign.name = "WarningBoard_SchoolGate";
            warningSign.transform.parent = cpRoot.transform;
            warningSign.transform.position = new Vector3(4f, 1.5f, -26f);
            warningSign.transform.localScale = new Vector3(2f, 2f, 0.4f);
            warningSign.AddComponent<InteractableWarningBoard>();

            // 5. Characters (Player & NPC)
            GameObject charRoot = new GameObject("--- CHARACTERS ---");

            // Player
            GameObject player = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            player.name = "Player_Student";
            player.tag = "Player";
            player.transform.parent = charRoot.transform;
            player.transform.position = new Vector3(0f, 1.1f, -32f);

            CharacterController charController = player.AddComponent<CharacterController>();
            charController.height = 2f;
            charController.radius = 0.5f;
            charController.center = new Vector3(0f, 1f, 0f);

            DesktopPlayerInput pInput = player.AddComponent<DesktopPlayerInput>();
            PlayerController playerCtrl = player.AddComponent<PlayerController>();
            Interactor interactor = player.AddComponent<Interactor>();

            // NPC Friend in need of assistance (CP5)
            GameObject npcFriend = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            npcFriend.name = "NPC_Friend_Minh_CP5";
            npcFriend.transform.parent = charRoot.transform;
            npcFriend.transform.position = new Vector3(3f, 2.5f, 10f);
            npcFriend.AddComponent<NavMeshAgent>();
            npcFriend.AddComponent<InteractableNpcFriend>();

            // Autonomous NPC Demo
            GameObject npcDemo = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            npcDemo.name = "NPC_Student_EvacuationDemo";
            npcDemo.transform.parent = charRoot.transform;
            npcDemo.transform.position = new Vector3(-2f, 1.1f, -32f);
            NavMeshAgent demoAgent = npcDemo.AddComponent<NavMeshAgent>();
            EvacuationNpcAgent demoBehavior = npcDemo.AddComponent<EvacuationNpcAgent>();

            // 6. Camera
            GameObject camObj = new GameObject("Main Camera");
            camObj.tag = "MainCamera";
            camObj.transform.parent = envRoot.transform;
            Camera cam = camObj.AddComponent<Camera>();
            camObj.AddComponent<AudioListener>();
            IsometricCameraController isoCam = camObj.AddComponent<IsometricCameraController>();
            isoCam.SetTarget(player.transform);
            camObj.AddComponent<CameraManager>();

            // 7. Managers
            GameObject managersRoot = new GameObject("--- MANAGERS ---");
            GameManager gameMgr = managersRoot.AddComponent<GameManager>();
            ScenarioManager scnMgr = managersRoot.AddComponent<ScenarioManager>();
            RouteManager routeMgr = managersRoot.AddComponent<RouteManager>();
            CheckpointManager cpMgr = managersRoot.AddComponent<CheckpointManager>();
            ScoreManager scoreMgr = managersRoot.AddComponent<ScoreManager>();
            PlayerActionLog logMgr = managersRoot.AddComponent<PlayerActionLog>();
            SimulationDebugPanel debugPanel = managersRoot.AddComponent<SimulationDebugPanel>();

            // Assign scenario asset
            if (scenarioAsset != null)
            {
                SerializedObject serializedScnMgr = new SerializedObject(scnMgr);
                serializedScnMgr.FindProperty("_activeScenario").objectReferenceValue = scenarioAsset;
                serializedScnMgr.ApplyModifiedProperties();
            }

            // 8. UI Canvas & HUD
            GameObject uiRoot = new GameObject("--- UI CANVAS ---");
            Canvas canvas = uiRoot.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            uiRoot.AddComponent<CanvasScaler>();
            uiRoot.AddComponent<GraphicRaycaster>();

            // EventSystem
            GameObject eventSystem = new GameObject("EventSystem");
            eventSystem.transform.parent = uiRoot.transform;
            eventSystem.AddComponent<UnityEngine.EventSystems.EventSystem>();
            eventSystem.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();

            // HUD Manager
            GameObject hudObj = new GameObject("HUD_Controller");
            hudObj.transform.parent = uiRoot.transform;
            HUDController hud = hudObj.AddComponent<HUDController>();
            InteractionPromptUI promptUI = hudObj.AddComponent<InteractionPromptUI>();
            WarningNotificationUI alertUI = hudObj.AddComponent<WarningNotificationUI>();
            ScenarioResultPanelUI resultUI = hudObj.AddComponent<ScenarioResultPanelUI>();

            // Save Scene
            EditorSceneManager.SaveScene(scene, SCENE_PATH);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Debug.Log($"<color=#2ECC71><b>[DisasterSim] Prototype Scene successfully generated and saved to: {SCENE_PATH}</b></color>");
            if (!Application.isBatchMode)
            {
                EditorUtility.DisplayDialog("Disaster Simulation Setup", "Prototype Scene generated successfully at:\n" + SCENE_PATH + "\n\nPress PLAY to test the simulation!", "OK");
            }
        }

        private static GameObject CreateTriggerZone(Transform parent, string objectName, string checkpointId, Vector3 position, Vector3 size)
        {
            GameObject triggerObj = new GameObject(objectName);
            triggerObj.transform.parent = parent;
            triggerObj.transform.position = position;

            BoxCollider box = triggerObj.AddComponent<BoxCollider>();
            box.isTrigger = true;
            box.size = size;

            CheckpointTrigger trigger = triggerObj.AddComponent<CheckpointTrigger>();

            SerializedObject so = new SerializedObject(trigger);
            so.FindProperty("_checkpointId").stringValue = checkpointId;
            so.ApplyModifiedProperties();

            return triggerObj;
        }
    }
}
#endif
