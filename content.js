(function () {
  "use strict";

  function init() {
    const css = `
      .bili-timer-indent .video-pod__item,
      .bili-timer-indent .list-box li,
      .bili-timer-indent .on-demand-list-item,
      .bili-timer-indent .click-item {
        padding-left: 35px !important;
        transition: padding 0.1s;
        position: relative !important;
        cursor: pointer !important;
        user-select: none !important;
      }

      .bili-timer-check {
        position: absolute !important;
        left: 8px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        z-index: 99999 !important;
        width: 16px !important;
        height: 16px !important;
        cursor: pointer;
        accent-color: #fb7299;
        outline: none;
        margin: 0 !important;
        display: block !important;
        pointer-events: none;
      }

      #timer-panel {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 12px;
        color: #e0e0e0;
        border-radius: 8px;
      }
      #timer-panel input[type="number"] {
        background: #36363a;
        border: 1px solid #555;
        color: #fff;
        padding: 5px;
        border-radius: 6px;
        text-align: center;
        outline: none;
        font-family: monospace;
      }
      #timer-panel input[type="number"]:focus {
        border-color: #fb7299;
      }
      #timer-panel button {
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        border: none;
        transition: 0.1s;
      }
      #timer-panel button:active {
        transform: translateY(1px);
      }
    `;
    const styleTag = document.createElement("style");
    styleTag.innerHTML = css;
    document.head.appendChild(styleTag);

    const checkExist = setInterval(() => {
      if (document.querySelector(".duration, .time")) {
        clearInterval(checkExist);
        createUI();
      }
    }, 1000);

    function createUI() {
      const ball = document.createElement("div");
      ball.innerHTML = "🕒";
      ball.style.cssText = `
        position: fixed;
        right: 0;
        top: 30%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        z-index: 99999;
        border-radius: 6px 0 0 6px;
        border: 2px solid rgba(251,114,153,0.45);
        border-right: none;
        background: #2d2d30;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      ball.style.cssText += "font-size: 18px;";
      document.body.appendChild(ball);

      const panel = document.createElement("div");
      panel.id = "timer-panel";
      panel.style.cssText = `
        display: none;
        padding: 15px;
        width: 190px;
        background: #2d2d30;
        position: fixed;
        right: 40px;
        top: 30%;
        border: 1px solid #555;
        border-radius: 8px;
        z-index: 10000;
        flex-direction: column;
        gap: 12px;
      `;
      document.body.appendChild(panel);

      panel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #444; padding-bottom:8px;">
          <span style="font-weight:bold; color:#fff;">时长统计</span>
          <span id="closePanel" style="cursor:pointer; color:#bbb; font-size:14px; padding:0 5px;">✕</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:5px;">
          <div style="color:#bbb; font-size:11px;">按集数区间</div>
          <div style="display:flex; gap:5px;">
            <input id="stP" type="number" placeholder="开始" style="width:100%;">
            <input id="edP" type="number" placeholder="结束" style="width:100%;">
          </div>
          <button id="calcRange" style="background:#3d3d42; color:#ddd; padding:6px; border:1px solid #555; border-radius:6px;">计算区间时长</button>
        </div>
        <div style="display:flex; flex-direction:column; gap:5px; margin-top:5px;">
          <button id="toggleSelect" style="background:#36363a; color:#bbb; border:1px dashed #666; border-radius:6px; padding:8px; font-size:12px;">开启 [选择模式]</button>
          <div style="font-size:10px; color:#666; text-align:center;">* 支持按住左键滑动多选</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px; margin-top:5px; border-top:1px solid #444; padding-top:10px;">
          <span style="color:#bbb;">倍速:</span>
          <input id="spD" type="number" value="1.0" step="0.25" style="width:50px;">
        </div>
        <div id="resultArea" style="background:#222228; border:1px solid #444; border-radius:6px; padding:10px; text-align:center; margin-top:5px;">
          <div id="resDesc" style="color:#bbb; font-size:11px; margin-bottom:2px;">等待操作</div>
          <div id="resTime" style="color:#fff; font-size:16px; font-weight:bold; font-family:monospace;">00:00:00</div>
        </div>
      `;

      panel.querySelector("#closePanel").onclick = () => {
        panel.style.display = "none";
        ball.style.background = "#2d2d30";
      };

      ball.onclick = () => {
        const isHidden = panel.style.display === "none";
        panel.style.display = isHidden ? "flex" : "none";
        ball.style.background = isHidden ? "#3d3d40" : "#2d2d30";
        if (isHidden) updateInfo();
      };

      let isSelectMode = false;
      let listObserver = null;
      let isDragging = false;
      let startDragIndex = -1;
      let initialCheckState = false;

      document.addEventListener("mouseup", () => {
        isDragging = false;
        startDragIndex = -1;
      });

      function getBiliItems() {
        const items = Array.from(document.querySelectorAll(".video-pod__item, .list-box li, .on-demand-list-item, .click-item"));
        return items.filter(function (item) { return item.querySelector(".duration, .time"); });
      }

      function parseToSeconds(timeStr) {
        var parts = timeStr.split(":").reverse().map(Number);
        return (parts[0] || 0) + (parts[1] || 0) * 60 + (parts[2] || 0) * 3600;
      }

      function formatTime(totalSec) {
        var h = Math.floor(totalSec / 3600);
        var m = Math.floor((totalSec % 3600) / 60);
        var s = Math.round(totalSec % 60);
        return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      }

      function updateInfo() {
        var data = getBiliItems();
        var currentP = new URLSearchParams(window.location.search).get("p") || 1;
        if (!panel.querySelector("#stP").value) panel.querySelector("#stP").value = currentP;
        if (!panel.querySelector("#edP").value) panel.querySelector("#edP").value = data.length;
      }

      function displayResult(label, sec, speed) {
        panel.querySelector("#resDesc").innerText = label;
        panel.querySelector("#resTime").innerText = formatTime(sec / speed);
      }

      panel.querySelector("#calcRange").onclick = function () {
        var items = getBiliItems();
        var start = Math.max(1, parseInt(panel.querySelector("#stP").value)) - 1;
        var end = Math.min(items.length, parseInt(panel.querySelector("#edP").value)) - 1;
        var speed = parseFloat(panel.querySelector("#spD").value) || 1.0;
        if (start > end) return;
        var totalSec = 0;
        for (var i = start; i <= end; i++) {
          totalSec += parseToSeconds(items[i].querySelector(".duration, .time").innerText.trim());
        }
        displayResult("区间 " + (start + 1) + "-" + (end + 1) + " 集", totalSec, speed);
      };

      function handleMouseDown(e) {
        if (!isSelectMode) return;
        e.preventDefault();
        e.stopPropagation();
        var items = getBiliItems();
        var currentItem = e.currentTarget;
        startDragIndex = items.indexOf(currentItem);
        isDragging = true;
        var cb = currentItem.querySelector(".bili-timer-check");
        if (cb) {
          cb.checked = !cb.checked;
          initialCheckState = cb.checked;
          calcCheckTotal();
        }
      }

      function handleMouseEnter(e) {
        if (!isSelectMode || !isDragging) return;
        var items = getBiliItems();
        var currentItem = e.currentTarget;
        var currentIndex = items.indexOf(currentItem);
        if (startDragIndex === -1 || currentIndex === -1) return;
        var min = Math.min(startDragIndex, currentIndex);
        var max = Math.max(startDragIndex, currentIndex);
        for (var i = min; i <= max; i++) {
          var cb = items[i].querySelector(".bili-timer-check");
          if (cb && cb.checked !== initialCheckState) {
            cb.checked = initialCheckState;
          }
        }
        calcCheckTotal();
      }

      function interceptClick(e) {
        if (isSelectMode) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }

      function attachListeners() {
        var items = getBiliItems();
        items.forEach(function (item) {
          if (!item.querySelector(".bili-timer-check")) {
            var cb = document.createElement("input");
            cb.type = "checkbox";
            cb.className = "bili-timer-check";
            item.prepend(cb);
            item.addEventListener("mousedown", handleMouseDown);
            item.addEventListener("mouseenter", handleMouseEnter);
            item.addEventListener("click", interceptClick, true);
          }
        });
      }

      function detachListeners() {
        var items = getBiliItems();
        items.forEach(function (item) {
          var cb = item.querySelector(".bili-timer-check");
          if (cb) cb.remove();
          item.removeEventListener("mousedown", handleMouseDown);
          item.removeEventListener("mouseenter", handleMouseEnter);
          item.removeEventListener("click", interceptClick, true);
        });
      }

      var toggleBtn = panel.querySelector("#toggleSelect");
      var listContainerSelector = ".video-pod__list, .list-box, .on-demand-list-container, .part-list";

      toggleBtn.onclick = function () {
        isSelectMode = !isSelectMode;
        var containers = document.querySelectorAll(listContainerSelector);

        if (isSelectMode) {
          toggleBtn.innerText = "关闭 [选择模式]";
          toggleBtn.style.background = "#fb7299";
          toggleBtn.style.color = "#fff";
          toggleBtn.style.borderStyle = "solid";
          toggleBtn.style.borderColor = "#fb7299";
          containers.forEach(function (c) { c.classList.add("bili-timer-indent"); });
          attachListeners();
          if (containers.length > 0) {
            listObserver = new MutationObserver(function () { attachListeners(); });
            containers.forEach(function (c) { listObserver.observe(c, { childList: true, subtree: true }); });
          }
        } else {
          toggleBtn.innerText = "开启 [选择模式]";
          toggleBtn.style.background = "#36363a";
          toggleBtn.style.color = "#bbb";
          toggleBtn.style.borderStyle = "dashed";
          toggleBtn.style.borderColor = "#666";
          if (listObserver) { listObserver.disconnect(); listObserver = null; }
          containers.forEach(function (c) { c.classList.remove("bili-timer-indent"); });
          detachListeners();
          displayResult("准备就绪", 0, 1);
        }
      };

      function calcCheckTotal() {
        var checked = document.querySelectorAll(".bili-timer-check:checked");
        var totalSec = 0;
        checked.forEach(function (cb) {
          var item = cb.parentElement;
          totalSec += parseToSeconds(item.querySelector(".duration, .time").innerText.trim());
        });
        var speed = parseFloat(panel.querySelector("#spD").value) || 1.0;
        displayResult("已勾选 " + checked.length + " 集", totalSec, speed);
      }

      panel.querySelector("#spD").oninput = function () {
        if (isSelectMode) calcCheckTotal();
      };
    }
  }

  init();
})();