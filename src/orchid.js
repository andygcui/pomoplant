window.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const startBtn = document.getElementById("start");
  const plantStage = document.getElementById("plant-stage");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const timerEl = document.getElementById("timer");
  const messageEl = document.getElementById("message");
  messageEl.style.minHeight = "2.5em"; // This will ensure the element is always at least 3 lines tall
  messageEl.style.display = "flex";
  messageEl.style.flexDirection = "column";
  messageEl.style.justifyContent = "center";
  messageEl.style.textAlign = "center";
  messageEl.style.whiteSpace = "pre-line"; // This will preserve the \n characters
  messageEl.textContent = "Click start to begin a focus session!";
  document.body.insertBefore(messageEl, plantStage);

  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      // Permission granted, you can send notifications
    } else {
      // Permission denied or dismissed
    }
  });

  function getTimerSeconds() {
    const focusMin = parseFloat(localStorage.getItem("focusTime"));
    const shortMin = parseFloat(localStorage.getItem("breakTime"));
    const longMin = parseFloat(localStorage.getItem("longBreakTime"));
    return {
      focus: (Number.isFinite(focusMin) && focusMin > 0 ? focusMin : 25) * 60,
      shortBreak: (Number.isFinite(shortMin) && shortMin > 0 ? shortMin : 5) * 60,
      longBreak: (Number.isFinite(longMin) && longMin > 0 ? longMin : 15) * 60
    };
  }

  let { focus: FOCUS_TIME, shortBreak: SHORT_BREAK_TIME, longBreak: LONG_BREAK_TIME } = getTimerSeconds();

  // State variables
  let currentTime = FOCUS_TIME;
  let timer = null;
  let isRunning = false;
  let isPaused = false;
  let isBreak = false;
  let stage = 0; // 0, 1, 2 for growth stages, 3 for fully grown
  let animationInterval = null;
  let hasCompletedFocus = false; // Track if a focus session has been completed

  // Plant stages and animations
  const plantStages = {
    static: {
      0: "assets/orchid/stage_0/1.png",
      1: "assets/orchid/stage_1/1.png",
      2: "assets/orchid/stage_2/1.png",
      3: "assets/orchid/image/orchid.png"
    },
    focus: {
      0: [
        "assets/orchid/stage_0/1.png"
      ],
      1: [
        "assets/orchid/stage_1/1.png",
        "assets/orchid/stage_1/2.png"
      ],
      2: [
        "assets/orchid/stage_2/1.png",
        "assets/orchid/stage_2/2.png"
      ]
    },
    grow: {
      0: [
        "assets/orchid/stage_0_grow/1.png",
        "assets/orchid/stage_0_grow/2.png"
      ],
      1: [
        "assets/orchid/stage_1_grow/1.png",
        "assets/orchid/stage_1_grow/2.png"
      ],
      2: [
        "assets/orchid/stage_2_grow/1.png",
        "assets/orchid/stage_2_grow/2.png"
      ]
    },
    final: [
      "assets/orchid/stage_3/1.png",
      "assets/orchid/stage_3/2.png"
    ]
  };

  // Helper functions
  function updateTimerDisplay() {
    const mins = Math.floor(currentTime / 60);
    const secs = currentTime % 60;
    minutesEl.textContent = String(mins).padStart(2, "0");
    secondsEl.textContent = String(secs).padStart(2, "0");
    
    // Add blinking effect when timer reaches 0:00
    if (currentTime === 0) {
      timerEl.classList.add('timer-blink');
    } else {
      timerEl.classList.remove('timer-blink');
    }
  }

  function clearAnimation() {
    if (animationInterval) {
      clearInterval(animationInterval);
      animationInterval = null;
    }
  }

  function startAnimation(frames) {
    clearAnimation();
    
    // If there's only one frame, just show it
    if (frames.length === 1) {
      plantStage.innerHTML = `<img src="${frames[0]}" class="plant" />`;
      return;
    }
    
    let currentFrame = 0;
    
    // Preload all frames to ensure consistent sizing
    const preloadImages = frames.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    
    // Wait for all images to load before starting animation
    Promise.all(preloadImages.map(img => {
      return new Promise(resolve => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
        }
      });
    })).then(() => {
      // Set the first frame immediately
      plantStage.innerHTML = `<img src="${frames[currentFrame]}" class="plant" />`;
      
      // Then start the interval for subsequent frames
      animationInterval = setInterval(() => {
        currentFrame = (currentFrame + 1) % frames.length;
        plantStage.innerHTML = `<img src="${frames[currentFrame]}" class="plant" />`;
      }, 1000);
    });
  }

  function showStaticImage(needsWater = false) {
    clearAnimation();
    // Preload the static image to ensure consistent sizing
    const img = new Image();
    img.src = plantStages.static[stage];
    img.onload = () => {
      const plantClass = needsWater ? 'plant needs-water' : 'plant';
      plantStage.innerHTML = `<img src="${plantStages.static[stage]}" class="${plantClass}" />`;
    };
  }

  function applyGrowthAnimation() {
    return new Promise(resolve => {
      // First apply shrinking animation
      const currentImg = plantStage.querySelector('img');
      if (currentImg) {
        currentImg.classList.add('shrinking');
        
        // After shrinking animation completes, show the new image with growing animation
        setTimeout(() => {
          const newImg = new Image();
          newImg.src = plantStages.static[stage];
          newImg.onload = () => {
            plantStage.innerHTML = `<img src="${plantStages.static[stage]}" class="plant growing" />`;
            
            // After growing animation completes, resolve the promise
            setTimeout(() => {
              const finalImg = plantStage.querySelector('img');
              if (finalImg) {
                finalImg.classList.remove('growing');
              }
              resolve();
            }, 800); // Match the duration of the grow animation
          };
        }, 500); // Match the duration of the shrink animation
      } else {
        // If no current image, just show the new one
        plantStage.innerHTML = `<img src="${plantStages.static[stage]}" class="plant" />`;
        resolve();
      }
    });
  }

  function startFinalAnimation() {
    clearAnimation();
    // Preload the final animation frames
    const preloadImages = plantStages.final.map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    
    // Wait for all images to load before starting animation
    Promise.all(preloadImages.map(img => {
      return new Promise(resolve => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
        }
      });
    })).then(() => {
      startAnimation(plantStages.final);
    });
  }

  function resetPlant() {
    stage = 0;
    hasCompletedFocus = false; // Reset the focus completion flag
    showStaticImage();
    messageEl.textContent = "A new orchid is ready to grow! \n ";
    ({ focus: FOCUS_TIME, shortBreak: SHORT_BREAK_TIME, longBreak: LONG_BREAK_TIME } = getTimerSeconds());
    currentTime = FOCUS_TIME;
    updateTimerDisplay();
    isRunning = false;
    isPaused = false;
    isBreak = false;
    startBtn.textContent = "Start Focus";
    plantStage.style.cursor = "default"; // Reset cursor
    
    // Show timer when resetting plant
    timerEl.classList.remove('timer-hidden');
  }

  function startFocusSession() {
    if (window.audio && window.audio.ensure) window.audio.ensure();
    if (window.audio && window.audio.background) { window.audio.background.refreshSelection(); window.audio.background.start(); }
    isRunning = true;
    isPaused = false;
    isBreak = false;
    startBtn.textContent = "Pause";
    messageEl.textContent = "Focus session started! \n ";
    
    // Start focus animation during focus session - do this before setting up the timer
    startAnimation(plantStages.focus[stage]);
    
    timer = setInterval(() => {
      currentTime--;
      updateTimerDisplay();
      if (currentTime > 0 && window.audio) window.audio.tickIfEnabled();
      
      if (currentTime <= 0) {
        clearInterval(timer);
        clearAnimation();
        isRunning = false;
        if (window.audio) window.audio.chimeIfEnabled();
        if (window.audio && window.audio.background) window.audio.background.stop();
        hasCompletedFocus = true; // Mark that a focus session has been completed
        window.focus(); // Bring the window to front
        
        if (stage < 3) {
          if (stage === 2) {
            messageEl.textContent = "Focus done! To start a long break, water your orchid!";
            new Notification("Long break time!", { body: "Water your orchid" });
          } else {
            messageEl.textContent = "Focus done! To start a short break, water your orchid!";
            new Notification("Short break time!", { body: "Water your orchid" });
          }
          startBtn.textContent = "Start another focus \n";
          plantStage.style.cursor = "pointer";
          showStaticImage(true);
        } else {
          messageEl.textContent = "Your orchid is fully grown! \n ";
          new Notification("Hooray!", { body: "Your orchid is fully grown" });
          startBtn.textContent = "Grow a new plant! \n";
          applyGrowthAnimation().then(() => {
            startFinalAnimation();
          });
          // Hide timer when plant is fully grown
          timerEl.classList.add('timer-hidden');
        }
      }
    }, 1000);
  }

  function startBreakSession() {
    if (window.audio && window.audio.ensure) window.audio.ensure();
    if (window.audio && window.audio.background) { window.audio.background.refreshSelection(); window.audio.background.start(); }
    isRunning = true;
    isPaused = false;
    isBreak = true;
    startBtn.textContent = "Pause";
    messageEl.textContent = "Break started! \n ";
    
    // Set break time based on stage
    currentTime = stage === 2 ? LONG_BREAK_TIME : SHORT_BREAK_TIME;
    updateTimerDisplay();
    
    // Start growth animation during break - do this before setting up the timer
    startAnimation(plantStages.grow[stage]);
    
    timer = setInterval(() => {
      currentTime--;
      updateTimerDisplay();
      if (currentTime > 0 && window.audio) window.audio.tickIfEnabled();
      
      if (currentTime <= 0) {
        clearInterval(timer);
        clearAnimation();
        isRunning = false;
        isBreak = false;
        if (window.audio) window.audio.chimeIfEnabled();
        if (window.audio && window.audio.background) window.audio.background.stop();
        
        if (stage < 3) {
          const previousStage = stage;
          stage++;
          
          // Track plant completion when it reaches stage 3
          if (stage === 3 && previousStage === 2 && window.AchievementsSystem) {
            const result = window.AchievementsSystem.recordPlantGrown('orchid');
            if (result.leveledUp) {
              messageEl.textContent = `Level ${result.level} reached! Your orchid is fully grown! \n `;
            }
          }
          
          if (stage < 3) {
            // Apply growth animation before showing the static image
            applyGrowthAnimation().then(() => {
              messageEl.textContent = "Your orchid has grown! Click Start to focus again. \n ";
              new Notification("Focus time!", { body: "Click start to focus" });
              startBtn.textContent = "Start Focus \n";
            });
          } else {
            applyGrowthAnimation().then(() => {
              startFinalAnimation();
            });
            if (messageEl.textContent.indexOf("Level") === -1) {
              messageEl.textContent = "Your orchid is fully grown! \n ";
            }
            startBtn.textContent = "Grow a new plant! \n";
            new Notification("Hooray!", { body: "Your orchid is fully grown" });
            // Hide timer when plant is fully grown
            timerEl.classList.add('timer-hidden');
          }
        }
        
        currentTime = FOCUS_TIME;
        updateTimerDisplay();
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timer);
    clearAnimation();
    isPaused = true;
    startBtn.textContent = "Resume";
    messageEl.textContent = isBreak ? "Break paused. \n " : "Focus paused. \n ";
    if (window.audio && window.audio.background) window.audio.background.stop();
    
    if (stage === 3) {
      applyGrowthAnimation().then(() => {
        startFinalAnimation();
      });
    } else {
      showStaticImage();
    }
  }

  function resumeTimer() {
    isPaused = false;
    startBtn.textContent = "Pause";
    messageEl.textContent = isBreak ? "Break resumed... \n " : "Focus resumed... \n ";
    
    // Resume appropriate animation based on session type - do this before setting up the timer
    if (isBreak) {
      startAnimation(plantStages.grow[stage]);
    } else if (stage === 3) {
      applyGrowthAnimation().then(() => {
        startFinalAnimation();
      });
    } else {
      startAnimation(plantStages.focus[stage]);
    }
    
    if (window.audio && window.audio.ensure) window.audio.ensure();
    if (window.audio && window.audio.background) { window.audio.background.refreshSelection(); window.audio.background.start(); }
    timer = setInterval(() => {
      currentTime--;
      updateTimerDisplay();
      if (currentTime > 0 && window.audio) window.audio.tickIfEnabled();
      
      if (currentTime <= 0) {
        clearInterval(timer);
        clearAnimation();
        isRunning = false;
        isPaused = false;
        if (window.audio) window.audio.chimeIfEnabled();
        if (window.audio && window.audio.background) window.audio.background.stop();
        
        if (isBreak) {
          isBreak = false;
          
          if (stage < 3) {
            const previousStage = stage;
            stage++;
            
            // Track plant completion when it reaches stage 3
            if (stage === 3 && previousStage === 2 && window.AchievementsSystem) {
              const result = window.AchievementsSystem.recordPlantGrown('orchid');
              if (result.leveledUp) {
                messageEl.textContent = `Level ${result.level} reached! Your orchid is fully grown! \n `;
              }
            }
            
            if (stage < 3) {
              // Apply growth animation before showing the static image
              applyGrowthAnimation().then(() => {
                messageEl.textContent = "Your orchid has grown! Click Start to focus again. \n ";
                new Notification("Focus time!", { body: "Click start to focus" });
                startBtn.textContent = "Start Focus \n";
              });
            } else {
              applyGrowthAnimation().then(() => {
                startFinalAnimation();
              });
              if (messageEl.textContent.indexOf("Level") === -1) {
                messageEl.textContent = "Your orchid is fully grown! \n ";
              }
              startBtn.textContent = "Grow a new plant! \n";
              new Notification("Hooray!", { body: "Your orchid is fully grown" });
              // Hide timer when plant is fully grown
              timerEl.classList.add('timer-hidden');
            }
          }
          
          currentTime = FOCUS_TIME;
          updateTimerDisplay();
        } else {
          if (stage < 3) {
            // Set hasCompletedFocus to true when a focus session completes, even if it was resumed from pause
            hasCompletedFocus = true;
            
            if (stage < 3) {
              const previousStage = stage;
              stage++;
              
              // Track plant completion when it reaches stage 3
              if (stage === 3 && previousStage === 2 && window.AchievementsSystem) {
                const result = window.AchievementsSystem.recordPlantGrown('orchid');
                if (result.leveledUp) {
                  messageEl.textContent = `Level ${result.level} reached! Your orchid is fully grown! \n `;
                }
              }
              
              if (stage < 3) {
                // Apply growth animation before showing the static image
                applyGrowthAnimation().then(() => {
                  messageEl.textContent = "Your orchid has grown! Click Start to focus again. \n ";
                  new Notification("Focus time!", { body: "Click start to focus" });
                  startBtn.textContent = "Start Focus \n";
                });
              } else {
                applyGrowthAnimation().then(() => {
                  startFinalAnimation();
                });
                if (messageEl.textContent.indexOf("Level") === -1) {
                  messageEl.textContent = "Your orchid is fully grown! \n ";
                }
                startBtn.textContent = "Grow a new plant! \n";
                new Notification("Hooray!", { body: "Your orchid is fully grown" });
                // Hide timer when plant is fully grown
                timerEl.classList.add('timer-hidden');
              }
            }
            
            if (stage === 2) {
              messageEl.textContent = "Focus done! To start a long break, water your orchid!";
              new Notification("Long break time!", { body: "Water your orchid" });
            } else {
              messageEl.textContent = "Focus done! To start a short break, water your orchid!";
              new Notification("Short break time!", { body: "Water your orchid" });
            }
          
            startBtn.textContent = "Start another focus";
            plantStage.style.cursor = "pointer";
            showStaticImage(true);
          } else {
            applyGrowthAnimation().then(() => {
              startFinalAnimation();
            });
            messageEl.textContent = "Your orchid is fully grown! \n ";
            new Notification("Hooray!", { body: "Your orchid is fully grown" });
            startBtn.textContent = "Grow a new plant!";
            // Hide timer when plant is fully grown
            timerEl.classList.add('timer-hidden');
          }
        }
      }
    }, 1000);
  }

  // Event listeners
  startBtn.addEventListener("click", () => {
    // Special case: restart plant after full growth
    if (startBtn.textContent.trim() === "Grow a new plant!") {
      window.location.href = "index.html";
      return;
    }
    
    // Pause logic
    if (isRunning && !isPaused) {
      pauseTimer();
      return;
    }
    
    // Resume logic
    if (isRunning && isPaused) {
      resumeTimer();
      return;
    }
    
    // Start new session
    if (!isBreak) {
      startFocusSession();
    } else {
      startBreakSession();
    }
  });

  plantStage.addEventListener("click", () => {
    // Only allow starting a break if a focus session has been completed
    if (!isBreak && !isRunning && stage < 3 && hasCompletedFocus) {
      startBreakSession();
      plantStage.style.cursor = "default";
    } else if (!hasCompletedFocus) {
      // If no focus session has been completed, show a message
      messageEl.textContent = "Complete a focus session first! \n ";
      
      // Store the current state to check if it changes
      const currentState = {
        isRunning,
        isPaused,
        isBreak
      };
      
      setTimeout(() => {
        // Only reset the message if the state hasn't changed (user didn't start a focus session)
        if (!isRunning && !isPaused && !isBreak && 
            currentState.isRunning === isRunning && 
            currentState.isPaused === isPaused && 
            currentState.isBreak === isBreak) {
          messageEl.textContent = "Click start to begin a focus session!";
        }
      }, 2000);
    }
  });

  // Initialize
  showStaticImage();
  updateTimerDisplay();
});
  