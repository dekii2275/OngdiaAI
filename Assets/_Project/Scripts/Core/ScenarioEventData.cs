using System;
using UnityEngine;

namespace DisasterSim.Core
{
    /// <summary>
    /// Serializable representation of an educational scenario event on the simulation timeline.
    /// </summary>
    [Serializable]
    public struct ScenarioEventData
    {
        [Tooltip("Unique identifier for this event")]
        public string EventId;

        [Tooltip("Trigger time in seconds from scenario start")]
        public float TriggerTimeSeconds;

        [Tooltip("Type of environmental or educational event")]
        public ScenarioEventType EventType;

        [Tooltip("Optional identifier of the affected hazard, route, or checkpoint target")]
        public string TargetId;

        [Tooltip("Optional text description, message, or parameter")]
        public string StringParameter;

        [Tooltip("Optional numeric modifier (e.g., rain intensity 0-1, flood elevation delta)")]
        public float FloatParameter;

        public ScenarioEventData(string id, float triggerTime, ScenarioEventType type, string targetId = "", string strParam = "", float floatParam = 0f)
        {
            EventId = id;
            TriggerTimeSeconds = triggerTime;
            EventType = type;
            TargetId = targetId;
            StringParameter = strParam;
            FloatParameter = floatParam;
        }
    }
}
