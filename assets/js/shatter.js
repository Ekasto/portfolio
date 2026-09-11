/* The visible portfolio page breaks apart to reveal the project beneath it.
   A same-origin preview warms on intent; after the reveal, normal navigation
   takes over. No router, canvas capture library, or permanent iframe is needed. */
(() => {
  'use strict';
  const destination = new URL('./tools/crack-painter-2d/', document.baseURI);
  const links = Array.from(document.querySelectorAll('.tool a[href]')).filter(link =>
    link.origin === location.origin && link.pathname === destination.pathname);
  if (!links.length || !Element.prototype.animate ||
      !window.CSS || !CSS.supports('clip-path', 'polygon(0 0,100% 0,0 100%)')) return;

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let preview = null;
  let active = null;

  function warmDestination() {
    if (preview || motion.matches) return;
    const frame = document.createElement('iframe');
    frame.className = 'shatter-destination';
    frame.title = 'Crack Painter 2D transition preview';
    frame.setAttribute('aria-hidden', 'true');
    frame.setAttribute('tabindex', '-1');
    frame.setAttribute('inert', '');
    const state = { frame, ready: false };
    state.loaded = new Promise(resolve => {
      frame.addEventListener('load', () => {
        // A failed response must never become the visible destination.
        try {
          state.ready = Boolean(frame.contentDocument.getElementById('project-title'));
        } catch { state.ready = false; }
        resolve(state.ready);
      }, { once: true });
    });
    preview = state;
    frame.src = destination.href;
    document.body.append(frame);
  }

  function cleanup() {
    const previous = active;
    active = null;
    if (previous) {
      clearTimeout(previous.timer);
      previous.animations.forEach(animation => animation.cancel());
      previous.overlay?.remove();
    }
    preview?.frame.remove();
    preview = null;
  }
  addEventListener('pagehide', cleanup);
  addEventListener('pageshow', cleanup);

  function edgeAt(cx, cy, angle, width, height) {
    const dx = Math.cos(angle), dy = Math.sin(angle);
    const tx = dx > 0 ? (width - cx) / dx : dx < 0 ? -cx / dx : Infinity;
    const ty = dy > 0 ? (height - cy) / dy : dy < 0 ? -cy / dy : Infinity;
    const distance = Math.min(tx, ty);
    return [cx + dx * distance, cy + dy * distance];
  }

  function geometry(cx, cy, width, height) {
    const angles = [[0,0],[width,0],[width,height],[0,height]]
      .map(([x,y]) => Math.atan2(y-cy,x-cx));
    const extra = width < 700 ? 4 : 6;
    for (let i = 0; i < extra; i++) angles.push(-Math.PI + (i + .36) * Math.PI * 2 / extra);
    angles.sort((a,b) => a-b);
    const nodes = angles.map((angle, i) => {
      const edge = edgeAt(cx,cy,angle,width,height);
      const fraction = .32 + (i % 3) * .085;
      return { edge, mid: [cx+(edge[0]-cx)*fraction,cy+(edge[1]-cy)*fraction] };
    });
    const polygons = [];
    let cracks = '';
    nodes.forEach((node, i) => {
      const next = nodes[(i+1)%nodes.length];
      polygons.push([[cx,cy],node.mid,next.mid]);
      polygons.push([node.mid,node.edge,next.edge,next.mid]);
      cracks += 'M'+cx+' '+cy+'L'+node.edge.join(' ')+'M'+node.mid.join(' ')+'L'+next.mid.join(' ');
    });
    return {polygons, cracks};
  }

  function captureMarkup(width) {
    // These inert copies stay on this machine, use the already loaded imagery,
    // and are clipped to the viewport. Remove live behaviors and duplicate IDs.
    const snapshot = document.createElement('div');
    snapshot.className = document.body.className + ' shatter__snapshot';
    snapshot.style.width = width + 'px';
    snapshot.style.top = -window.scrollY + 'px';
    for (const child of document.body.children) {
      if (['SCRIPT','IFRAME'].includes(child.tagName) || child.classList.contains('shatter')) continue;
      snapshot.append(child.cloneNode(true));
    }
    snapshot.querySelectorAll('script,iframe,dialog').forEach(element => element.remove());
    snapshot.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
    snapshot.querySelectorAll('[autofocus]').forEach(element => element.removeAttribute('autofocus'));
    snapshot.querySelectorAll('video').forEach(video => {
      video.removeAttribute('autoplay');
      video.removeAttribute('src');
      video.querySelectorAll('source').forEach(source => source.remove());
      video.preload = 'none';
    });
    return snapshot;
  }

  function breakPage(event, transition, go) {
    const width = window.innerWidth, height = window.innerHeight;
    const cx = event.detail ? Math.max(width*.12,Math.min(event.clientX,width*.88)) : width*.5;
    const cy = event.detail ? Math.max(height*.12,Math.min(event.clientY,height*.88)) : height*.5;
    const {polygons,cracks} = geometry(cx,cy,width,height);
    const snapshot = captureMarkup(document.documentElement.clientWidth);
    const overlay = document.createElement('div');
    overlay.className = 'shatter';
    overlay.setAttribute('aria-hidden','true');
    transition.overlay = overlay;
    const fragments = [];
    polygons.forEach((points,i) => {
      const piece = document.createElement('div');
      piece.className = 'shatter__piece';
      piece.setAttribute('inert','');
      piece.style.clipPath = 'polygon('+points.map(point => point.map(n => n.toFixed(2)+'px').join(' ')).join(',')+')';
      piece.append(snapshot.cloneNode(true));
      overlay.append(piece);
      const x = points.reduce((sum,p)=>sum+p[0],0)/points.length;
      const y = points.reduce((sum,p)=>sum+p[1],0)/points.length;
      const vx=x-cx, vy=y-cy, distance=Math.hypot(vx,vy)||1;
      const travel=Math.max(width,height)*(.7+(i%3)*.1);
      fragments.push({piece, dx:vx/distance*travel, dy:vy/distance*travel+height*.24, rotation:(i%2 ? 1 : -1)*(9+i%5*3), delay:90+(distance/Math.hypot(width,height))*65});
    });
    const ns='http://www.w3.org/2000/svg';
    const lines=document.createElementNS(ns,'svg');
    lines.setAttribute('class','shatter__cracks');
    lines.setAttribute('viewBox','0 0 '+width+' '+height);
    const path=document.createElementNS(ns,'path');
    path.setAttribute('d',cracks);
    lines.append(path);
    overlay.append(lines);
    document.body.append(overlay);
    // Match the currently viewed layout, including fonts that finished loading
    // since the destination warmed, before any of the page fragments move.
    const originalTool = document.querySelector('main .tool');
    const clonedTool = overlay.querySelector('.tool');
    if (originalTool && clonedTool) {
      const correction = originalTool.getBoundingClientRect().top - clonedTool.getBoundingClientRect().top;
      overlay.querySelectorAll('.shatter__snapshot').forEach(copy => {
        copy.style.top = (-window.scrollY + correction) + 'px';
      });
    }
    const targetRoot = preview.frame.contentDocument.documentElement;
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme) targetRoot.setAttribute('data-theme', currentTheme);
    else targetRoot.removeAttribute('data-theme');
    // The fragments cover the original page before the new page becomes visible.
    preview.frame.classList.add('is-revealing');
    transition.animations.push(lines.animate([{opacity:0},{opacity:1,offset:.35},{opacity:0}],{duration:260,fill:'forwards'}));
    const flights = fragments.map(({piece,dx,dy,rotation,delay}) => {
      const animation=piece.animate([
        {transform:'translate3d(0,0,0) rotate(0deg)',opacity:1,offset:0},
        {opacity:1,offset:.55},
        {transform:'translate3d('+dx+'px,'+dy+'px,0) rotate('+rotation+'deg) scale(.84)',opacity:0,offset:1}
      ],{duration:660,delay,easing:'cubic-bezier(.42,0,.65,1)',fill:'forwards'});
      transition.animations.push(animation);
      return animation.finished;
    });
    Promise.all(flights).then(go, () => {});
  }

  links.forEach(link => {
    ['pointerenter','pointerdown','focus'].forEach(name => link.addEventListener(name,warmDestination));
    link.addEventListener('click', async event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
          event.shiftKey || event.altKey || link.hasAttribute('download') ||
          (link.target && link.target !== '_self') || motion.matches) return;
      if (active) { event.preventDefault(); return; }
      event.preventDefault();
      const transition = {overlay:null,animations:[],timer:null,leaving:false};
      active = transition;
      function go() {
        if (active !== transition || transition.leaving) return;
        transition.leaving=true;
        clearTimeout(transition.timer);
        location.assign(link.href);
      }
      // Loading or rendering trouble can only shorten the effect, never trap a link.
      transition.timer=setTimeout(go,1500);
      try {
        warmDestination();
        const ready=await Promise.race([preview.loaded,new Promise(resolve=>setTimeout(()=>resolve(false),400))]);
        if (active !== transition) return;
        if (!ready || motion.matches) { go(); return; }
        breakPage(event,transition,go);
      } catch { go(); }
    });
  });

  // Start warming only as the tool enters view, never on initial page load.
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries => {
      if (entries.some(entry=>entry.isIntersecting)) {
        warmDestination();
        observer.disconnect();
      }
    }, {rootMargin:'100px'});
    observer.observe(links[0].closest('.tool'));
  }
})();
