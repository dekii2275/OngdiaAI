using System;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace DisasterSim.Core
{
    /// <summary>
    /// Coordinates the top-level lifecycle states of the simulation.
    /// Strictly handles state transitions and broadcasts events without being a god object.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("State Configuration")]
        [SerializeField] private GameState _initialState = GameState.Boot;
        [SerializeField] private bool _autoStartOnAwake = true;

        public GameState CurrentState { get; private set; } = GameState.Boot;

        public event Action<GameState, GameState> OnGameStateChanged;
        public event Action OnGameStarted;
        public event Action<bool> OnGamePaused; // true = paused, false = resumed
        public event Action<string> OnGameCompleted;
        public event Action<string> OnGameFailed;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            CurrentState = _initialState;
        }

        private void Start()
        {
            if (_autoStartOnAwake && CurrentState == GameState.Boot)
            {
                StartGame();
            }
        }

        private void OnDestroy()
        {
            if (Instance == this)
            {
                Instance = null;
            }
        }

        /// <summary>
        /// Transitions the simulation to the Playing state.
        /// </summary>
        public void StartGame()
        {
            ChangeState(GameState.Playing);
            Time.timeScale = 1.0f;
            OnGameStarted?.Invoke();
        }

        /// <summary>
        /// Pauses or unpauses simulation time and input processing.
        /// </summary>
        public void TogglePause()
        {
            if (CurrentState == GameState.Playing)
            {
                PauseGame();
            }
            else if (CurrentState == GameState.Paused)
            {
                ResumeGame();
            }
        }

        public void PauseGame()
        {
            if (CurrentState != GameState.Playing) return;

            ChangeState(GameState.Paused);
            Time.timeScale = 0.0f;
            OnGamePaused?.Invoke(true);
        }

        public void ResumeGame()
        {
            if (CurrentState != GameState.Paused) return;

            ChangeState(GameState.Playing);
            Time.timeScale = 1.0f;
            OnGamePaused?.Invoke(false);
        }

        /// <summary>
        /// Concludes the simulation successfully (e.g. all objectives met, reached safe zone).
        /// </summary>
        public void CompleteGame(string summary = "Sơ tán thành công đến điểm tập kết an toàn.")
        {
            if (CurrentState == GameState.Completed || CurrentState == GameState.Failed) return;

            ChangeState(GameState.Completed);
            Time.timeScale = 0.0f;
            OnGameCompleted?.Invoke(summary);
        }

        /// <summary>
        /// Ends the simulation with a failure condition (e.g., student swept by flood, trapped in landslide).
        /// </summary>
        public void FailGame(string failureReason = "Bạn đã gặp nguy hiểm do không tuân thủ cảnh báo sơ tán!")
        {
            if (CurrentState == GameState.Completed || CurrentState == GameState.Failed) return;

            ChangeState(GameState.Failed);
            Time.timeScale = 0.0f;
            OnGameFailed?.Invoke(failureReason);
        }

        /// <summary>
        /// Reloads the active scene for another attempt.
        /// </summary>
        public void RestartSimulation()
        {
            Time.timeScale = 1.0f;
            Scene currentScene = SceneManager.GetActiveScene();
            SceneManager.LoadScene(currentScene.buildIndex);
        }

        private void ChangeState(GameState newState)
        {
            if (CurrentState == newState) return;

            GameState oldState = CurrentState;
            CurrentState = newState;
            OnGameStateChanged?.Invoke(oldState, newState);
        }
    }
}
