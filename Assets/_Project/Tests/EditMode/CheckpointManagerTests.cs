using NUnit.Framework;
using UnityEngine;
using DisasterSim.Core;
using DisasterSim.Gameplay;

namespace DisasterSim.Tests
{
    [TestFixture]
    public class CheckpointManagerTests
    {
        private GameObject _holder;
        private CheckpointManager _checkpointManager;
        private ScoreManager _scoreManager;

        [SetUp]
        public void SetUp()
        {
            _holder = new GameObject("Test_CheckpointHolder");
            _scoreManager = _holder.AddComponent<ScoreManager>();
            _checkpointManager = _holder.AddComponent<CheckpointManager>();
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
        public void CheckpointManager_InitialState_FirstCheckpointIsActive()
        {
            Assert.AreEqual(8, _checkpointManager.Checkpoints.Count);
            Assert.IsNotNull(_checkpointManager.CurrentActiveCheckpoint);
            Assert.AreEqual("CP0", _checkpointManager.CurrentActiveCheckpoint.CheckpointId);
        }

        [Test]
        public void CheckpointManager_CompleteCheckpoint_MarksCompletedAndAdvances()
        {
            bool success = _checkpointManager.CompleteCheckpoint("CP0");
            Assert.IsTrue(success);
            Assert.IsTrue(_checkpointManager.IsCompleted("CP0"));

            Assert.IsNotNull(_checkpointManager.CurrentActiveCheckpoint);
            Assert.AreEqual("CP1", _checkpointManager.CurrentActiveCheckpoint.CheckpointId);
        }

        [Test]
        public void CheckpointManager_DuplicateCompletion_ReturnsFalse()
        {
            _checkpointManager.CompleteCheckpoint("CP1");
            bool duplicateAttempt = _checkpointManager.CompleteCheckpoint("CP1");

            Assert.IsFalse(duplicateAttempt, "Completing an already completed checkpoint should return false.");
        }

        [Test]
        public void CheckpointManager_Completion_AwardsCategoryScore()
        {
            _checkpointManager.CompleteCheckpoint("CP2"); // CP2: 15 pts -> HazardAwareness
            Assert.AreEqual(15, _scoreManager.GetScore(ScoreCategory.HazardAwareness));
        }
    }
}
