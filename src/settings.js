window.addEventListener("DOMContentLoaded", () => {
    // Load current settings
    document.getElementById("tickingToggle").checked = localStorage.getItem("tickSound") === "true";
    document.getElementById("chimeToggle").checked = localStorage.getItem("chimeSound") === "true";
  document.getElementById("musicSelect").value = localStorage.getItem("backgroundMusic") || "none";
    document.getElementById("focusTime").value = localStorage.getItem("focusTime") || 25;
  document.getElementById("breakTime").value = localStorage.getItem("breakTime") || 5;
  document.getElementById("longBreakTime").value = localStorage.getItem("longBreakTime") || 15;
  
    document.getElementById("saveSettings").addEventListener("click", () => {
      localStorage.setItem("tickSound", document.getElementById("tickingToggle").checked);
      localStorage.setItem("chimeSound", document.getElementById("chimeToggle").checked);
    localStorage.setItem("backgroundMusic", document.getElementById("musicSelect").value);
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
  