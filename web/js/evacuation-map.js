(function (root) {
  'use strict';
  // Coordinates follow the original 1536 × 1024 village painting.
  // Curves describe the road; the four major legs retain the chapter's puzzle.
  const segments = [
    { name: 'Từ trường tới cầu đá', detail: 'Ra cổng trường, theo đường làng tới đầu cầu bên này suối.', arrow: '↑',
      path: 'M547 845 C564 839 590 828 584 812 C578 792 551 774 539 751 C534 733 533 718 511 706 C488 696 454 691 427 672 C409 660 409 649 427 640 C454 628 476 615 487 594 L512 562',
      end: [512, 562], arrowAt: [459, 623] },
    { name: 'Qua cầu đá', detail: 'Đi hết cây cầu nối hai bờ. Tìm điểm nối ở đầu cầu phía bên kia.', arrow: '→',
      path: 'M512 562 C579 546 648 531 707 522 C736 517 761 516 784 512',
      end: [784, 512], arrowAt: [648, 533] },
    { name: 'Theo đường lên núi', detail: 'Men theo con đường uốn lượn lên cao, tới ngã nối dưới khu tập kết.', arrow: '↑',
      path: 'M784 512 C809 508 822 496 813 481 C805 468 784 457 787 444 C791 428 822 416 852 405 C878 395 890 383 881 366 C869 346 851 323 842 305 C830 282 829 269 850 253',
      end: [850, 253], arrowAt: [854, 382] },
    { name: 'Tới điểm tập kết', detail: 'Theo đường vào khu sân trên núi cao. Đây là điểm tập kết của trường.', arrow: '→',
      path: 'M850 253 C864 236 881 225 900 231 C927 239 948 247 973 252 C990 252 995 235 1012 226 L1045 212',
      end: [1045, 212], arrowAt: [959, 248] }
  ];
  const image = '../map/background%20%2B%20nh%C3%A0.png';
  const svg = () => `<svg class="village-map" viewBox="0 0 1536 1024" role="group" aria-label="Bản đồ làng: trường ở chân núi, cầu đá qua suối và điểm tập kết trên núi cao">
    <defs>
      <filter id="map-label-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0b211e" flood-opacity=".45"/></filter>
      <linearGradient id="map-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#102e26" stop-opacity=".1"/><stop offset="1" stop-color="#102e26" stop-opacity=".22"/></linearGradient>
    </defs>
    <image href="${image}" width="1536" height="1024" aria-hidden="true"/>
    <rect width="1536" height="1024" fill="url(#map-shade)" pointer-events="none"/>
    <g class="map-landmarks" aria-hidden="true">
      <g transform="translate(1396 65)" class="map-compass"><circle r="37"/><path d="M0 -25 L9 13 L0 7 L-9 13 Z"/><text y="-49" text-anchor="middle">BẮC</text></g>
      <text x="243" y="305" class="map-place">XÓM LÀNG</text>
      <text x="154" y="133" class="map-place">RUỘNG BẬC THANG</text>
      <text x="1001" y="763" transform="rotate(22 1001 763)" class="map-water-name">SUỐI</text>
      <g class="map-place-label" transform="translate(1164 489)"><rect width="229" height="43" rx="8"/><text x="114" y="29" text-anchor="middle">SƯỜN DỐC ĐÁ</text></g>
      <g class="map-place-label" transform="translate(899 327)"><rect width="199" height="43" rx="8"/><text x="99" y="29" text-anchor="middle">ĐƯỜNG LÊN NÚI</text></g>
      <g class="map-place-label" transform="translate(560 461)"><rect width="161" height="43" rx="8"/><text x="80" y="29" text-anchor="middle">CẦU ĐÁ</text></g>
    </g>
    <g class="map-route" aria-label="Tuyến được đánh dấu từ trường tới điểm tập kết">
      ${segments.map((segment, index) => `<g class="map-segment" data-segment="${index}" data-arrow="${segment.arrow}" role="button" tabindex="0" aria-label="Đọc đoạn tuyến ${index + 1}: ${segment.name}" aria-pressed="false">
        <path d="${segment.path}" class="map-route-outline"/><path d="${segment.path}" class="map-route-line"/>
        <path d="${segment.path}" class="map-route-hit"/>
        <g class="map-direction" transform="translate(${segment.arrowAt.join(' ')})" aria-hidden="true"><circle r="29"/><text y="12" text-anchor="middle">${segment.arrow}</text></g>
      </g>`).join('')}
    </g>
    <g class="map-waypoints" aria-hidden="true">${segments.map((segment, index) => `<g class="map-waypoint" data-node="${index}" transform="translate(${segment.end.join(' ')})"><circle class="map-point-rim" r="23"/><circle class="map-point" r="16"/><text y="7" text-anchor="middle">${index + 1}</text></g>`).join('')}</g>
    <g class="map-school-pin" aria-hidden="true"><circle cx="547" cy="845" r="26"/><circle cx="547" cy="845" r="12"/><path d="M522 858 L466 899 L367 899"/>
      <g transform="translate(167 869)"><rect width="213" height="62" rx="9"/><text x="18" y="27" class="map-pin-title">TRƯỜNG LÀNG</text><text x="18" y="49" class="map-pin-subtitle">Xuất phát · Lớp 4B</text></g>
    </g>
    <g class="map-destination-pin" aria-hidden="true"><circle cx="1045" cy="212" r="34"/><path d="M1065 186 L1100 144 L1194 144"/>
      <g transform="translate(1093 95)"><rect width="323" height="75" rx="9"/><text x="18" y="32" class="map-pin-title">ĐIỂM TẬP KẾT</text><text x="18" y="57" class="map-pin-subtitle">Khu sân trên núi cao</text></g>
    </g>
  </svg>`;

  function markup(hint = false) {
    return `<header class="map-header"><div><span class="eyebrow">TRƯỜNG LÀNG / TUYẾN LÊN NÚI</span><h2>Sơ đồ sơ tán — Lớp 4B</h2><p>Từ trường qua cầu đá, lên điểm tập kết trên núi cao.</p></div><span class="map-document-mark" aria-hidden="true">01<span>BẢN ĐỒ KHU VỰC</span></span></header>
      <div class="map-layout"><div class="map-column">
        <div class="map-toolbar"><span>Quan sát toàn tuyến</span><div class="map-zoom-controls" role="group" aria-label="Phóng to bản đồ"><button id="map-zoom-out" aria-label="Thu nhỏ bản đồ">−</button><output id="map-zoom-level" aria-live="polite">100%</output><button id="map-zoom-in" aria-label="Phóng to bản đồ">+</button><button id="map-reset" aria-label="Xem toàn bộ bản đồ">Toàn cảnh</button></div></div>
        <div id="map-viewport" class="map-viewport" tabindex="0" aria-label="Bản đồ có thể phóng to và kéo để quan sát"><div id="map-space" class="map-space"><div id="map-canvas" class="map-canvas">${svg()}</div></div></div>
        <div class="map-legend"><span><i class="legend-source"></i>Trường / xuất phát</span><span><i class="legend-route"></i>Tuyến sơ tán</span><span><i class="legend-node"></i>Điểm nối</span><span><i class="legend-destination"></i>Điểm tập kết</span></div>
      </div><aside class="map-reading"><span class="eyebrow">ĐỌC TUYẾN ĐƯỜNG</span><h3>Lần theo các điểm nối</h3><p class="map-reading-intro">${hint ? 'Bắt đầu từ trường. Quan sát bốn chặng chính theo thứ tự.' : 'Bắt đầu từ trường ở chân núi. Chạm vào tuyến hoặc các điểm nối màu vàng để đọc từng chặng.'}</p>
        <div class="map-progress" aria-label="Tiến trình đọc tuyến">${segments.map((segment, index) => `<button data-progress="${index}" aria-label="Quan sát chặng ${index + 1}">${index + 1}</button>`).join('')}</div>
        <section class="map-observation" aria-label="Chặng đang quan sát"><div class="map-observation-top"><span id="map-chapter-label">ĐIỂM XUẤT PHÁT</span><span id="map-current-direction" hidden aria-label="Hướng chính của chặng đang đọc"></span></div><h4 id="map-current-name">Trường làng · Lớp 4B</h4><p id="map-current-detail">Tuyến bắt đầu tại cổng trường và kết thúc ở khu sân trên núi cao.</p></section>
        <p id="route-status" class="route-status" aria-live="polite">Điểm xuất phát: Lớp 4B.</p>
        <div class="map-actions"><button id="route-start" class="primary">Bắt đầu từ lớp 4B <span>→</span></button><button id="route-done" class="secondary">Ghi nhớ và quay lại lớp</button></div>
        <p class="map-reading-foot">Ghi nhớ hướng chính của từng chặng để liên hệ với khóa bốn ô.</p>
      </aside></div><footer class="map-footer"><span>Phóng to để xem rõ · Kéo để di chuyển bản đồ</span><span>Chỉ hiện hướng của chặng đang quan sát</span></footer>`;
  }

  function attach(container, callbacks) {
    const find = selector => container.querySelector(selector);
    find('#route-start').onclick = callbacks.onStart;
    find('#route-done').onclick = callbacks.onDone;
    container.querySelectorAll('[data-segment]').forEach(element => {
      element.onclick = () => callbacks.onSegment(Number(element.dataset.segment));
      element.onkeydown = event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); callbacks.onSegment(Number(element.dataset.segment)); }
      };
    });
    container.querySelectorAll('[data-progress]').forEach(element => {
      element.onclick = () => callbacks.onSegment(Number(element.dataset.progress));
    });
    container.querySelectorAll('[data-node]').forEach(element => {
      element.onclick = () => callbacks.onSegment(Number(element.dataset.node));
    });
    const viewport = find('#map-viewport'), space = find('#map-space'), canvas = find('#map-canvas');
    let zoom = 1, baseWidth = 0, drag = null;
    function layout() {
      baseWidth = Math.max(1, Math.min(viewport.clientWidth, viewport.clientHeight * 1.5));
      canvas.style.width = baseWidth * zoom + 'px'; canvas.style.height = baseWidth * zoom / 1.5 + 'px';
      space.style.width = Math.max(viewport.clientWidth, baseWidth * zoom) + 'px';
      space.style.height = Math.max(viewport.clientHeight, baseWidth * zoom / 1.5) + 'px';
      find('#map-zoom-level').textContent = Math.round(zoom * 100) + '%';
      find('#map-zoom-out').disabled = zoom <= 1; find('#map-zoom-in').disabled = zoom >= 3;
      viewport.classList.toggle('is-zoomed', zoom > 1);
    }
    function setZoom(next) {
      const oldWidth = baseWidth * zoom, oldHeight = oldWidth / 1.5;
      const centerX = (viewport.scrollLeft + viewport.clientWidth / 2 - canvas.offsetLeft) / oldWidth;
      const centerY = (viewport.scrollTop + viewport.clientHeight / 2 - canvas.offsetTop) / oldHeight;
      zoom = Math.max(1, Math.min(3, next)); layout();
      viewport.scrollLeft = canvas.offsetLeft + baseWidth * zoom * centerX - viewport.clientWidth / 2;
      viewport.scrollTop = canvas.offsetTop + baseWidth * zoom / 1.5 * centerY - viewport.clientHeight / 2;
    }
    find('#map-zoom-in').onclick = () => setZoom(zoom + .5);
    find('#map-zoom-out').onclick = () => setZoom(zoom - .5);
    find('#map-reset').onclick = () => { zoom = 1; layout(); viewport.scrollTo(0, 0); };
    viewport.onpointerdown = event => {
      if (zoom === 1 || event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('[data-segment],[data-node]')) return;
      drag = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
      viewport.setPointerCapture(event.pointerId); viewport.classList.add('is-dragging'); event.preventDefault();
    };
    viewport.onpointermove = event => { if (drag) { viewport.scrollLeft = drag.left + drag.x - event.clientX; viewport.scrollTop = drag.top + drag.y - event.clientY; } };
    viewport.onpointerup = viewport.onpointercancel = viewport.onlostpointercapture = () => { drag = null; viewport.classList.remove('is-dragging'); };
    const observer = new ResizeObserver(layout); observer.observe(viewport);
    const frame = requestAnimationFrame(layout);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }

  function update(container, state) {
    container.querySelectorAll('[data-node]').forEach(element => {
      const index = Number(element.dataset.node);
      element.classList.toggle('active', index === state.highlight); element.classList.toggle('is-read', index < state.progress);
    });
    container.querySelectorAll('[data-segment]').forEach(element => {
      const index = Number(element.dataset.segment), active = index === state.highlight;
      element.classList.toggle('active', active); element.classList.toggle('is-read', index < state.progress);
      element.setAttribute('aria-pressed', String(active));
    });
    container.querySelectorAll('[data-progress]').forEach(element => {
      const index = Number(element.dataset.progress);
      element.classList.toggle('is-read', index < state.progress); element.classList.toggle('is-current', index === state.highlight);
    });
    container.querySelector('.map-school-pin').classList.toggle('is-started', state.started);
    const current = segments[state.highlight], find = selector => container.querySelector(selector);
    find('#map-chapter-label').textContent = current ? 'CHẶNG ' + (state.highlight + 1) + ' / 4' : 'ĐIỂM XUẤT PHÁT';
    find('#map-current-name').textContent = current?.name || 'Trường làng · Lớp 4B';
    find('#map-current-detail').textContent = current?.detail || 'Tuyến bắt đầu tại cổng trường và kết thúc ở khu sân trên núi cao.';
    find('#map-current-direction').hidden = !current;
    find('#map-current-direction').textContent = current?.arrow || '';
    find('#route-status').textContent = state.progress === 4 ? 'Đã đọc hết bốn chặng. Hãy ghi nhớ các hướng.' : state.started ? `Đã quan sát ${state.progress}/4 chặng. Tìm điểm nối tiếp theo.` : 'Điểm xuất phát: Lớp 4B.';
    find('#route-start').innerHTML = state.started ? 'Đọc lại từ trường <span>↻</span>' : 'Bắt đầu từ lớp 4B <span>→</span>';
  }
  const api = { segments, image, markup, attach, update };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SceneEvacuationMap = api;
})(typeof window === 'object' ? window : globalThis);
