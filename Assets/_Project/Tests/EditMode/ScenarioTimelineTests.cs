using NUnit.Framework;
using UnityEngine;
using DisasterSim.Core;
using DisasterSim.Gameplay;

namespace DisasterSim.Tests
{
    [TestFixture]
    public class ScenarioTimelineTests
    {
        private GameObject _holder;
        private ScenarioManager _scenarioManager;

        private class MockReceiver : IScenarioEventReceiver
        {
            public int ReceivedCount = 0;
            public ScenarioEventData LastEvent;

            public void OnScenarioEventReceived(ScenarioEventData eventData)
            {
                ReceivedCount++;
                LastEvent = eventData;
            }
        }

        [SetUp]
        public void SetUp()
        {
            _holder = new GameObject("Test_ScenarioHolder");
            _scenarioManager = _holder.AddComponent<ScenarioManager>();
        }

        [TearDown]
        public void TearDown()
        {
            if (_holder != null)
            {
                Object.DestroyImmediate(_holder);
            }
        }

        [Test]
        public void ScenarioManager_DefaultFactory_BuildsOrderedTimeline()
        {
            ScenarioData scenario = FlashFloodScenarioFactory.CreateDefaultScenario();
            Assert.IsNotNull(scenario);
            Assert.AreEqual("SCN_FLASH_FLOOD_LANDSLIDE_01", scenario.ScenarioId);
            Assert.Greater(scenario.TimelineEvents.Count, 0);

            // Verify order
            for (int i = 1; i < scenario.TimelineEvents.Count; i++)
            {
                Assert.GreaterOrEqual(
                    scenario.TimelineEvents[i].TriggerTimeSeconds,
                    scenario.TimelineEvents[i - 1].TriggerTimeSeconds,
                    "Timeline events should be in non-decreasing time order."
                );
            }
        }

        [Test]
        public void ScenarioManager_FastForward_TriggersEventsInOrder()
        {
            ScenarioData scenario = FlashFloodScenarioFactory.CreateDefaultScenario();
            _scenarioManager.LoadScenario(scenario);

            MockReceiver receiver = new MockReceiver();
            _scenarioManager.RegisterReceiver(receiver);

            // Jump to 100 seconds (should trigger 0s, 30s, 90s events -> 3 events)
            _scenarioManager.JumpToTime(100f);

            Assert.AreEqual(3, receiver.ReceivedCount, "Jumping to 100s should evaluate 3 events.");
            Assert.AreEqual(ScenarioEventType.RiverLevelRaised, receiver.LastEvent.EventType);
        }
    }
}
