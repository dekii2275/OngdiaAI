namespace DisasterSim.Core
{
    /// <summary>
    /// Contract for systems or managers that listen for broadcasted scenario timeline events.
    /// </summary>
    public interface IScenarioEventReceiver
    {
        /// <summary>
        /// Invoked when a scenario event triggers on the timeline.
        /// </summary>
        void OnScenarioEventReceived(ScenarioEventData eventData);
    }
}
