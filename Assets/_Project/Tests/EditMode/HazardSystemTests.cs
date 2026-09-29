using NUnit.Framework;
using UnityEngine;
using DisasterSim.Core;
using DisasterSim.Gameplay;

namespace DisasterSim.Tests
{
    [TestFixture]
    public class HazardSystemTests
    {
        private GameObject _holder;
        private FloodHazard _floodHazard;
        private LandslideHazard _landslideHazard;

        [SetUp]
        public void SetUp()
        {
            _holder = new GameObject("Test_HazardHolder");
            _floodHazard = _holder.AddComponent<FloodHazard>();
            _landslideHazard = _holder.AddComponent<LandslideHazard>();
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
        public void FloodHazard_StateProgression_TransitionsCorrectly()
        {
            Assert.AreEqual(FloodState.Normal, _floodHazard.CurrentFloodState);
            Assert.AreEqual(HazardState.Inactive, _floodHazard.CurrentState);

            _floodHazard.SetFloodState(FloodState.Rising, "Upstream heavy rain");
            Assert.AreEqual(FloodState.Rising, _floodHazard.CurrentFloodState);
            Assert.AreEqual(HazardState.Warning, _floodHazard.CurrentState);
            Assert.Greater(_floodHazard.WaterLevelNormalized, 0f);

            _floodHazard.SetFloodState(FloodState.Dangerous, "Water reaching bridge deck");
            Assert.AreEqual(HazardState.Dangerous, _floodHazard.CurrentState);

            _floodHazard.SetFloodState(FloodState.Blocked, "Bridge collapsed");
            Assert.AreEqual(HazardState.Blocked, _floodHazard.CurrentState);
            Assert.AreEqual(1.0f, _floodHazard.WaterLevelNormalized);
        }

        [Test]
        public void LandslideHazard_StateProgression_TransitionsCorrectly()
        {
            Assert.AreEqual(LandslideState.Normal, _landslideHazard.CurrentLandslideState);
            Assert.AreEqual(HazardState.Inactive, _landslideHazard.CurrentState);

            _landslideHazard.SetLandslideState(LandslideState.CrackDetected, "Fissures observed on slope");
            Assert.AreEqual(HazardState.Warning, _landslideHazard.CurrentState);

            _landslideHazard.SetLandslideState(LandslideState.Rockfall, "Debris tumbling onto road");
            Assert.AreEqual(HazardState.Dangerous, _landslideHazard.CurrentState);

            _landslideHazard.SetLandslideState(LandslideState.Blocked, "Massive slope slide");
            Assert.AreEqual(HazardState.Blocked, _landslideHazard.CurrentState);
            Assert.AreEqual(1.0f, _landslideHazard.DebrisAmountNormalized);
        }

        [Test]
        public void FloodHazard_Reset_RestoresInitialState()
        {
            _floodHazard.SetFloodState(FloodState.Blocked, "Disaster occurred");
            _floodHazard.ResetHazard();

            Assert.AreEqual(FloodState.Normal, _floodHazard.CurrentFloodState);
            Assert.AreEqual(HazardState.Inactive, _floodHazard.CurrentState);
            Assert.AreEqual(0f, _floodHazard.WaterLevelNormalized);
        }
    }
}
