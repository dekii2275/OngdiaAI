using System;

namespace DisasterSim.Core
{
    /// <summary>
    /// Contract for an evacuation route or path corridor.
    /// Allows hazards or game logic to change route availability without coupling to physical path objects.
    /// </summary>
    public interface IRoute
    {
        /// <summary>
        /// Unique route identifier (e.g., "RouteA", "RouteB", "RouteC").
        /// </summary>
        string RouteId { get; }

        /// <summary>
        /// Friendly name (e.g. "Tuyến A - Đường qua cầu suối").
        /// </summary>
        string RouteName { get; }

        /// <summary>
        /// Current availability of the route.
        /// </summary>
        RouteState CurrentState { get; }

        /// <summary>
        /// Fired when route state changes.
        /// </summary>
        event Action<IRoute, RouteState> OnRouteStateChanged;

        /// <summary>
        /// Command the route state to change.
        /// </summary>
        void SetState(RouteState newState, string reason = null);
    }
}
