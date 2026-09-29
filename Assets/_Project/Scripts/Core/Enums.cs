using System;

namespace DisasterSim.Core
{
    /// <summary>
    /// Represents the high-level operational lifecycle states of the simulation.
    /// </summary>
    public enum GameState
    {
        Boot,
        Playing,
        Paused,
        Completed,
        Failed
    }

    /// <summary>
    /// Generic state transition for environmental hazards.
    /// </summary>
    public enum HazardState
    {
        Inactive = 0,
        Warning = 1,
        Dangerous = 2,
        Blocked = 3
    }

    /// <summary>
    /// Conceptual progression states for flash flood simulations.
    /// </summary>
    public enum FloodState
    {
        Normal = 0,
        Rising = 1,
        Dangerous = 2,
        Blocked = 3
    }

    /// <summary>
    /// Conceptual progression states for landslide/rockfall simulations.
    /// </summary>
    public enum LandslideState
    {
        Normal = 0,
        CrackDetected = 1,
        Rockfall = 2,
        Landslide = 3,
        Blocked = 4
    }

    /// <summary>
    /// Operational status of an evacuation route.
    /// </summary>
    public enum RouteState
    {
        Open = 0,
        Warning = 1,
        Blocked = 2
    }

    /// <summary>
    /// Standard educational scoring categories totaling 100 points.
    /// </summary>
    public enum ScoreCategory
    {
        HazardAwareness = 0,     // Max 25 pts: Identifying muddy water, cracking slopes, warning sirens
        RouteChoice = 1,          // Max 25 pts: Selecting higher elevation path, abandoning flooded routes
        ReactionTime = 2,         // Max 20 pts: Responding promptly to alarms and situational alerts
        GroupSafety = 3,          // Max 15 pts: Supporting peers, assisting injured/hesitant classmates
        EvacuationCompletion = 4  // Max 15 pts: Successfully reaching the safe assembly point
    }

    /// <summary>
    /// Presentation camera perspectives supported by the architecture.
    /// </summary>
    public enum CameraMode
    {
        Isometric,
        ThirdPerson,
        VR
    }

    /// <summary>
    /// Predefined types for timed and conditional scenario events.
    /// </summary>
    public enum ScenarioEventType
    {
        WarningIssued,
        RainIntensityChanged,
        RiverLevelRaised,
        BridgeWarning,
        BridgeBlocked,
        RockfallStarted,
        LandslideStarted,
        RouteBlocked,
        Custom
    }

    /// <summary>
    /// Mechanism by which a checkpoint is triggered.
    /// </summary>
    public enum CheckpointTriggerType
    {
        VolumeTrigger,
        Interaction,
        ScenarioEvent,
        Manual
    }
}
