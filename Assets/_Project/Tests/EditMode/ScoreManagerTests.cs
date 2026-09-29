using NUnit.Framework;
using UnityEngine;
using DisasterSim.Core;
using DisasterSim.Gameplay;

namespace DisasterSim.Tests
{
    [TestFixture]
    public class ScoreManagerTests
    {
        private GameObject _holder;
        private ScoreManager _scoreManager;

        [SetUp]
        public void SetUp()
        {
            _holder = new GameObject("Test_ScoreHolder");
            _scoreManager = _holder.AddComponent<ScoreManager>();
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
        public void ScoreManager_InitialScore_IsZero()
        {
            Assert.AreEqual(0, _scoreManager.GetTotalScore());
            Assert.AreEqual(0, _scoreManager.GetScore(ScoreCategory.HazardAwareness));
            Assert.AreEqual(0, _scoreManager.GetScore(ScoreCategory.RouteChoice));
        }

        [Test]
        public void ScoreManager_AddPoints_IncrementsCorrectCategoryAndTotal()
        {
            _scoreManager.Add(ScoreCategory.HazardAwareness, 15, "Identified muddy water");
            _scoreManager.Add(ScoreCategory.RouteChoice, 10, "Chose hill path");

            Assert.AreEqual(15, _scoreManager.GetScore(ScoreCategory.HazardAwareness));
            Assert.AreEqual(10, _scoreManager.GetScore(ScoreCategory.RouteChoice));
            Assert.AreEqual(25, _scoreManager.GetTotalScore());
            Assert.AreEqual(2, _scoreManager.History.Count);
        }

        [Test]
        public void ScoreManager_CategoryLimits_ClampToMaxAllowablePoints()
        {
            // Max for HazardAwareness is 25
            _scoreManager.Add(ScoreCategory.HazardAwareness, 50, "Excessive bonus");
            Assert.AreEqual(ScoreManager.MAX_HAZARD_AWARENESS, _scoreManager.GetScore(ScoreCategory.HazardAwareness));

            // Max for GroupSafety is 15
            _scoreManager.Add(ScoreCategory.GroupSafety, 100, "Super helper");
            Assert.AreEqual(ScoreManager.MAX_GROUP_SAFETY, _scoreManager.GetScore(ScoreCategory.GroupSafety));
        }

        [Test]
        public void ScoreManager_FullEvaluation_Totals100PointsMax()
        {
            _scoreManager.Add(ScoreCategory.HazardAwareness, ScoreManager.MAX_HAZARD_AWARENESS, "Full HA");
            _scoreManager.Add(ScoreCategory.RouteChoice, ScoreManager.MAX_ROUTE_CHOICE, "Full RC");
            _scoreManager.Add(ScoreCategory.ReactionTime, ScoreManager.MAX_REACTION_TIME, "Full RT");
            _scoreManager.Add(ScoreCategory.GroupSafety, ScoreManager.MAX_GROUP_SAFETY, "Full GS");
            _scoreManager.Add(ScoreCategory.EvacuationCompletion, ScoreManager.MAX_EVACUATION_COMPLETION, "Full EC");

            Assert.AreEqual(100, _scoreManager.GetTotalScore());
        }
    }
}
