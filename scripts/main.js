// ================== Render Welcome Page ==================
function renderWelcomePage() {
  document.body.innerHTML = `
    <div class="welcome-screen fade-in">
      <div class="welcome-header"></div>
      <div class="welcome-body">
        <!-- Left: startup logo -->
        <img src="assets/startlogo.png" alt="Windows XP Logo" class="startup-logo">

        <!-- Right: framed avatar + stacked text -->
        <div class="user-frame" id="user-frame">
          <img src="assets/User.png" alt="User" class="user-avatar">
          <div class="user-text">
            <div class="user-name">vDev</div>
            <div class="user-role">Computer Engineer</div>
          </div>
        </div>
      </div>
      <div class="welcome-footer">
        <div class="restart-btn">
          <img src="assets/restart.png" alt="Restart" class="restart-icon">
          <span class="restart-text">Restart</span>
        </div>

        <div class="welcome-message">
          After you log on, the system is yours to explore.<br>
          Every detail has been designed with a purpose.
        </div>
      </div>
    </div>
  `;

  document.body.style.margin = "0";
  document.body.style.background = "none";
  document.body.style.display = "block";

  bindWelcomeEvents();
}

// ================== Bind Events for Welcome Screen ==================
function bindWelcomeEvents() {
  const restartIcon = document.querySelector(".restart-icon");
  if (restartIcon) {
    restartIcon.addEventListener("click", () => {
      const overlay = document.createElement("div");
      overlay.className = "restart-overlay";
      overlay.innerHTML = `
        <div class="restart-popup">
          <div class="restart-popup-header">Power Options</div>
          <div class="restart-popup-body">
            <div class="popup-options">
              <div class="popup-option restart-action">
                <img src="assets/restart.png" class="popup-icon" alt="Restart">
                <div class="popup-text">Restart</div>
              </div>
              <div class="popup-option shutdown-disabled">
                <img src="assets/power.png" class="popup-icon" alt="Power">
                <div class="popup-text">Power</div>
              </div>
            </div>
          </div>
          <div class="restart-popup-footer">
            <button class="popup-cancel">Cancel</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.querySelector(".popup-cancel").addEventListener("click", () => {
        overlay.remove();
        const dim = document.querySelector(".dim-overlay");
        if (dim) dim.remove();
      });

      overlay.querySelector(".restart-action").addEventListener("click", () => {
        location.reload();
      });

      const shutdownBtn = overlay.querySelector(".shutdown-disabled");
      shutdownBtn.style.opacity = "0.5";
      shutdownBtn.style.pointerEvents = "none";

      setTimeout(() => {
        if (document.body.contains(overlay)) {
          const dim = document.createElement("div");
          dim.className = "dim-overlay";
          document.body.appendChild(dim);
        }
      }, 3000);
    });
  }

  const userFrame = document.getElementById("user-frame");
  if (userFrame) {
    userFrame.addEventListener("click", () => {
      loadDesktop();
    });
  }
}

// ================== Create XP Window ==================
function createWindow(appName, title, content) {
  const win = document.createElement("div");
  win.className = "xp-window";
  win.innerHTML = `
  <div class="xp-titlebar">
    <span class="xp-title">${title}</span>
    <div class="xp-controls">
      <button class="xp-min">_</button>
      <button class="xp-max">□</button>
      <button class="xp-close"></button>
    </div>
  </div>
  <div class="xp-content">${content}</div>
`;

  document.body.appendChild(win);

  win.style.top = "100px";
  win.style.left = "120px";

  const titleBar = win.querySelector(".xp-titlebar");
  let offsetX, offsetY, isDragging = false;

  titleBar.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex = 1000;
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      win.style.left = e.clientX - offsetX + "px";
      win.style.top = e.clientY - offsetY + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // === Close Button ===
  win.querySelector(".xp-close").addEventListener("click", () => {
    win.remove();
  });

  // === Window Controls ===
  const minBtn = win.querySelector(".xp-min");
  const maxBtn = win.querySelector(".xp-max");

  let isMaximized = false;
  let prevPos = { top: 0, left: 0, width: 0, height: 0 };

  minBtn.addEventListener("click", () => {
    win.style.display = "none";
  });

  maxBtn.addEventListener("click", () => {
    if (!isMaximized) {
      prevPos = {
        top: win.offsetTop,
        left: win.offsetLeft,
        width: win.offsetWidth,
        height: win.offsetHeight
      };
      win.style.top = "0";
      win.style.left = "0";
      win.style.width = "100vw";
      win.style.height = "calc(100vh - 32px)";
      isMaximized = true;
    } else {
      win.style.top = prevPos.top + "px";
      win.style.left = prevPos.left + "px";
      win.style.width = prevPos.width + "px";
      win.style.height = prevPos.height + "px";
      isMaximized = false;
    }
  });

  win.style.resize = "both";
  win.style.overflow = "auto";

  return win;
}

// ================== Recently Used Apps ==================
let recentApps = [];
function addToRecent(appName, iconPath) {
  recentApps = recentApps.filter(app => app.name !== appName);
  recentApps.unshift({ name: appName, icon: iconPath });
  if (recentApps.length > 5) recentApps.pop();
}

function renderRecentSubmenu(triggerEl) {
  let submenu = document.querySelector(".recent-submenu");
  if (submenu) submenu.remove();

  submenu = document.createElement("div");
  submenu.className = "recent-submenu";

  recentApps.forEach(app => {
    const item = document.createElement("div");
    item.className = "start-item";
    item.innerHTML = `<img src="${app.icon}"><span>${app.name}</span>`;
    item.addEventListener("click", () => {
      createWindow(app.name.toLowerCase(), app.name, `<p>Reopening ${app.name}</p>`);
      addToRecent(app.name, app.icon);
      renderRecentSubmenu(triggerEl);
    });
    submenu.appendChild(item);
  });

  document.body.appendChild(submenu);

  const rect = triggerEl.getBoundingClientRect();
  submenu.style.position = "absolute";
  submenu.style.left = rect.right + "px";
  submenu.style.top = rect.top + "px";

  submenu.addEventListener("mouseleave", () => {
    submenu.remove();
  });
}

// ================== Render Desktop ==================
function loadDesktop() {
  const welcomeBody = document.querySelector(".welcome-body");
  const welcomeFooter = document.querySelector(".welcome-footer");

  if (welcomeBody) welcomeBody.classList.add("no-divider");
  if (welcomeBody) welcomeBody.innerHTML = `<div class="welcome-text fade-welcome">Welcome</div>`;
  if (welcomeFooter) welcomeFooter.innerHTML = "";

  setTimeout(() => {
    document.body.innerHTML = `
  <div class="desktop">
    <img src="assets/Windows.jpg" alt="Desktop Wallpaper" class="desktop-wallpaper">

    <div class="desktop-icons">
      <div class="desktop-icon" data-app="about">
        <img src="assets/about.png" alt="About Me">
        <span>About Me</span>
      </div>
      <div class="desktop-icon" data-app="resume">
        <img src="assets/resume.png" alt="My Resume">
        <span>My Resume</span>
      </div>
      <div class="desktop-icon" data-app="projects">
        <img src="assets/explorer.png" alt="My Projects">
        <span>My Projects</span>
      </div>
      <div class="desktop-icon" data-app="contact">
        <img src="assets/contact.png" alt="Contact">
        <span>Contact</span>
      </div>
    </div>

    <div class="taskbar">
      <div class="taskbar-left">
        <div class="start-btn">
          <img src="assets/logo.png" alt="Start" class="start-icon">
          <span class="start-text">Start</span>
        </div>
      </div>
      <div class="taskbar-right">
        <div class="taskbar-clock" id="taskbar-clock"></div>
      </div>
    </div>
  </div>
`;

    function updateClock() {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      document.getElementById("taskbar-clock").textContent = `${hours}:${minutes} ${ampm}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    document.querySelectorAll(".desktop-icon").forEach(icon => {
      icon.addEventListener("dblclick", () => {
        const app = icon.dataset.app;
        if (app === "about") {
          createWindow("about", "About Me", "<p>This is the About Me window.</p>");
          addToRecent("About Me", "assets/about.png");
        } else if (app === "resume") {
          createWindow("resume", "My Resume", "<p>Here goes my resume preview.</p>");
          addToRecent("My Resume", "assets/resume.png");
        } else if (app === "projects") {
          createWindow("projects", "My Projects", "<p>List of projects will go here.</p>");
          addToRecent("My Projects", "assets/explorer.png");
        } else if (app === "contact") {
          createWindow("contact", "Contact Me", "<p>Form or contact details here.</p>");
          addToRecent("Contact", "assets/contact.png");
        }
      });
    });

    const startBtn = document.querySelector(".start-btn");
    startBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      let menu = document.querySelector(".start-menu");
      if (menu) {
        menu.remove();
      } else {
        menu = document.createElement("div");
        menu.className = "start-menu";
        menu.innerHTML = `
          <div class="start-menu-top">
            <div class="start-user">
              <img src="assets/User.png" class="start-user-pic">
              <div class="start-user-name">vDev</div>
            </div>
          </div>
          <div class="start-menu-content">
            <div class="start-menu-left">
              <div class="start-item"><img src="assets/ie.png"><span>My Projects</span></div>
              <div class="start-item"><img src="assets/mail.png"><span>Contact Me</span></div>
              <div class="start-item"><img src="assets/about.png"><span>About Me</span></div>
              <div class="start-item"><img src="assets/paint.png"><span>Paint</span></div>
              <div class="start-item"><img src="assets/media.png"><span>Media Player</span></div>
              <div class="start-item"><img src="assets/music.png"><span>Music Player</span></div>
            </div>

            <div class="start-menu-right">
              <div class="start-item" data-app="github"><img src="assets/github.png"><span>GitHub</span></div>
              <div class="start-item" data-app="linkedin"><img src="assets/link.png"><span>LinkedIn</span></div>
              <div class="start-item recent-toggle"><img src="assets/recent.png"><span>Recently Used ▶</span></div>
              <div class="start-item"><img src="assets/cmd.png"><span>Command Prompt</span></div>
              <div class="start-item"><img src="assets/resume.png"><span>My Resume</span></div>
            </div>
          </div>

          <div class="start-menu-bottom">
            <button class="start-logoff"><img src="assets/Logout.png"> Log Off</button>
            <button class="start-shutdown" disabled><img src="assets/power.png"> Power</button>
          </div>
        `;
        document.body.appendChild(menu);

        menu.querySelector("[data-app='github']").addEventListener("click", () => {
          addToRecent("GitHub", "assets/github.png");
        });
        menu.querySelector("[data-app='linkedin']").addEventListener("click", () => {
          addToRecent("LinkedIn", "assets/link.png");
        });

        const recentToggle = menu.querySelector(".recent-toggle");
        recentToggle.addEventListener("mouseenter", () => {
          renderRecentSubmenu(recentToggle);
        });
        recentToggle.addEventListener("mouseleave", () => {
          setTimeout(() => {
            const submenu = document.querySelector(".recent-submenu");
            if (submenu && !submenu.matches(":hover")) submenu.remove();
          }, 200);
        });

        menu.querySelector(".start-logoff").addEventListener("click", () => {
          menu.remove();
          renderWelcomePage();
        });

        const shutdownBtn = menu.querySelector(".start-shutdown");
        shutdownBtn.disabled = true;
        shutdownBtn.style.opacity = "0.5";
        shutdownBtn.style.cursor = "not-allowed";

        document.addEventListener("click", function closeMenu(ev) {
          if (!menu.contains(ev.target) && !startBtn.contains(ev.target)) {
            menu.remove();
            document.querySelectorAll(".recent-submenu").forEach(sm => sm.remove());
            document.removeEventListener("click", closeMenu);
          }
        });
      }
    });
  }, 3000);
}

// ================== Boot Sequence ==================
setTimeout(() => {
  const bootScreen = document.querySelector(".boot-screen");
  const footer = document.querySelector(".footer");
  bootScreen.classList.add("fade-out");
  footer.classList.add("fade-out");

  setTimeout(() => {
    renderWelcomePage();
  }, 1000);
}, 5000);

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
});

// ================== FAST BOOT TEST MODE ==================
document.addEventListener("keydown", (e) => {
  // If pressed "0" key during boot, skip everything
  if (e.key === "0") {
    const bootScreen = document.querySelector(".boot-screen");
    const footer = document.querySelector(".footer");
    if (bootScreen && footer) {
      bootScreen.classList.add("fade-out");
      footer.classList.add("fade-out");
      setTimeout(() => {
        loadDesktop(); // jump straight to desktop
      }, 300); // smooth fade timing
    }
  }
});
