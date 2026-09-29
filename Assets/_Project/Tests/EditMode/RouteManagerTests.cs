using NUnit.Framework;
using UnityEngine;
using DisasterSim.Core;
using DisasterSim.Gameplay;

namespace DisasterSim.Tests
{
    [TestFixture]
    public class RouteManagerTests
    {
        private GameObject _holder;
        private RouteManager _routeManager;

        [SetUp]
        public void SetUp()
        {
            _holder = new GameObject("Test_RouteManagerHolder");
            _routeManager = _holder.AddComponent<RouteManager>();
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
        public void RouteManager_DefaultRoutes_AreInitiallyOpen()
        {
            RouteData routeA = _routeManager.GetRoute("RouteA");
            Assert.IsNotNull(routeA, "RouteA should be initialized by default.");
            Assert.AreEqual(RouteState.Open, routeA.CurrentState, "RouteA should initially be Open.");
            Assert.IsTrue(_routeManager.IsRouteOpen("RouteA"), "IsRouteOpen should return true for RouteA.");
        }

        [Test]
        public void RouteManager_TransitionToBlocked_UpdatesStateAndFiresEvent()
        {
            bool eventFired = false;
            string changedRouteId = null;
            RouteState newStateResult = RouteState.Open;

            _routeManager.OnRouteStateChanged += (id, state, reason) =>
            {
                eventFired = true;
                changedRouteId = id;
                newStateResult = state;
            };

            _routeManager.SetRouteState("RouteA", RouteState.Blocked, "Bridge washed away");

            Assert.IsTrue(eventFired, "OnRouteStateChanged event should be fired.");
            Assert.AreEqual("RouteA", changedRouteId);
            Assert.AreEqual(RouteState.Blocked, newStateResult);
            Assert.IsFalse(_routeManager.IsRouteOpen("RouteA"), "RouteA should no longer be open.");
        }

        [Test]
        public void RouteManager_TransitionToWarning_MaintainsWarningState()
        {
            _routeManager.SetRouteState("RouteC", RouteState.Warning, "Slope crack detected");
            RouteData routeC = _routeManager.GetRoute("RouteC");

            Assert.AreEqual(RouteState.Warning, routeC.CurrentState);
            Assert.IsFalse(_routeManager.IsRouteOpen("RouteC"), "Route in Warning state should not be considered fully Open.");
        }
    }
}
