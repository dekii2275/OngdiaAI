using NUnit.Framework;
using UnityEngine;
using DisasterSim.Gameplay;

namespace DisasterSim.Tests
{
    [TestFixture]
    public class ActionLogTests
    {
        private GameObject _holder;
        private PlayerActionLog _actionLog;

        [SetUp]
        public void SetUp()
        {
            _holder = new GameObject("Test_ActionLogHolder");
            _actionLog = _holder.AddComponent<PlayerActionLog>();
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
        public void PlayerActionLog_RecordAction_AppendsEntry()
        {
            Assert.AreEqual(0, _actionLog.Entries.Count);

            _actionLog.RecordAction("Warning received", "SchoolAlarm", 10);
            _actionLog.RecordAction("Player chose Route B", "RouteB", 10);

            Assert.AreEqual(2, _actionLog.Entries.Count);
            Assert.AreEqual("Warning received", _actionLog.Entries[0].Action);
            Assert.AreEqual("RouteB", _actionLog.Entries[1].Target);
            Assert.AreEqual(10, _actionLog.Entries[0].ScoreImpact);
        }

        [Test]
        public void PlayerActionLog_GenerateTeacherReport_IncludesEvaluation()
        {
            _actionLog.RecordAction("Evacuation started", "SchoolGate", 10);
            _actionLog.RecordAction("Safe zone reached", "CommunityHouse", 15);

            string report = _actionLog.GenerateTeacherReport("Nguyen Van A", 90);

            Assert.IsTrue(report.Contains("BÁO CÁO KẾT QUẢ DIỄN TẬP"));
            Assert.IsTrue(report.Contains("Nguyen Van A"));
            Assert.IsTrue(report.Contains("90 / 100"));
            Assert.IsTrue(report.Contains("Xuất sắc"));
        }
    }
}
