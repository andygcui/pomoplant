window.addEventListener("DOMContentLoaded", () => {
    // Load current settings and initialize toggle buttons
    let tickSoundEnabled = localStorage.getItem("tickSound") === "true";
    let chimeSoundEnabled = localStorage.getItem("chimeSound") === "true";
    
    const tickingToggle = document.getElementById("tickingToggle");
    const chimeToggle = document.getElementById("chimeToggle");
    
    // Set initial toggle states
    if (tickSoundEnabled) {
      tickingToggle.classList.add("active");
      tickingToggle.textContent = "ON";
      tickingToggle.dataset.toggle = "true";
    } else {
      tickingToggle.textContent = "OFF";
      tickingToggle.dataset.toggle = "false";
    }
    
    if (chimeSoundEnabled) {
      chimeToggle.classList.add("active");
      chimeToggle.textContent = "ON";
      chimeToggle.dataset.toggle = "true";
    } else {
      chimeToggle.textContent = "OFF";
      chimeToggle.dataset.toggle = "false";
    }
    
    // Add click handlers to toggle buttons
    tickingToggle.addEventListener("click", () => {
      tickSoundEnabled = !tickSoundEnabled;
      if (tickSoundEnabled) {
        tickingToggle.classList.add("active");
        tickingToggle.textContent = "ON";
        tickingToggle.dataset.toggle = "true";
      } else {
        tickingToggle.classList.remove("active");
        tickingToggle.textContent = "OFF";
        tickingToggle.dataset.toggle = "false";
      }
    });
    
    chimeToggle.addEventListener("click", () => {
      chimeSoundEnabled = !chimeSoundEnabled;
      if (chimeSoundEnabled) {
        chimeToggle.classList.add("active");
        chimeToggle.textContent = "ON";
        chimeToggle.dataset.toggle = "true";
      } else {
        chimeToggle.classList.remove("active");
        chimeToggle.textContent = "OFF";
        chimeToggle.dataset.toggle = "false";
      }
    });
    
    // Handle custom slider for background music
    let selectedMusic = localStorage.getItem("backgroundMusic") || "none";
    const musicSlider = document.getElementById("musicSlider");
    const musicButtons = musicSlider.querySelectorAll("button");
    
    // Set initial active button
    musicButtons.forEach(button => {
      if (button.dataset.value === selectedMusic) {
        button.classList.add("active");
      }
    });
    
    // Add click handlers to slider buttons
    musicButtons.forEach(button => {
      button.addEventListener("click", () => {
        musicButtons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        selectedMusic = button.dataset.value;
      });
    });
    
    document.getElementById("focusTime").value = localStorage.getItem("focusTime") || 25;
  document.getElementById("breakTime").value = localStorage.getItem("breakTime") || 5;
  document.getElementById("longBreakTime").value = localStorage.getItem("longBreakTime") || 15;
  
    document.getElementById("saveSettings").addEventListener("click", () => {
      localStorage.setItem("tickSound", tickSoundEnabled);
      localStorage.setItem("chimeSound", chimeSoundEnabled);
    localStorage.setItem("backgroundMusic", selectedMusic);
      localStorage.setItem("focusTime", document.getElementById("focusTime").value);
    localStorage.setItem("breakTime", document.getElementById("breakTime").value);
    localStorage.setItem("longBreakTime", document.getElementById("longBreakTime").value);
    const notice = document.getElementById("saveNotice");
    if (notice) {
      notice.textContent = "Settings saved!";
      setTimeout(() => { notice.textContent = ""; }, 1500);
    }
    });
  });
  