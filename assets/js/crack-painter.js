/* A small browser illustration of a prepared fracture, using the tool's sample art. */
(() => {
  'use strict';

  const scriptUrl = document.currentScript && document.currentScript.src;
  const textureUrl = scriptUrl
    ? new URL('../img/crack-painter/plate.webp', scriptUrl).href
    : new URL('../../assets/img/crack-painter/plate.webp', document.baseURI).href;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const svgNamespace = 'http://www.w3.org/2000/svg';

  function svgElement(name, attributes = {}) {
    const element = document.createElementNS(svgNamespace, name);
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function setupFracture() {
    const stage = document.getElementById('fracture-stage');
    const art = document.getElementById('fracture-art');
    const toggle = document.getElementById('fracture-toggle');
    const label = document.getElementById('fracture-label');
    const status = document.getElementById('fracture-status');
    if (!stage || !art || !toggle || !label || !status) return;

    const texture = new Image();
    texture.onload = () => {
      const svg = svgElement('svg', {
        viewBox: '0 0 500 460',
        width: '100%',
        height: '100%',
        'aria-hidden': 'true',
        focusable: 'false',
        preserveAspectRatio: 'xMidYMid meet',
      });
      const definitions = svgElement('defs');
      svg.append(definitions);

      // The crop isolates the masonry sample in the original product screenshot.
      const wall = { x: 165, y: 90, width: 170, height: 240 };
      const crop = { x: 704, y: 128, width: 182, height: 258 };
      const scaleX = wall.width / crop.width;
      const scaleY = wall.height / crop.height;
      const seams = [250, 208, 250, 292];
      const landings = [
        [-78, 210, -23], [112, 227, 28],
        [-81, 225, -30], [40, 214, 17],
        [-56, 174, 12], [124, 179, -19],
        [-1, 141, -8], [47, 137, 34],
      ];
      const pieces = [];

      svg.append(svgElement('path', {
        d: 'M 58 447 H 460',
        stroke: 'currentColor',
        'stroke-opacity': '0.16',
        'stroke-width': '1',
      }));

      seams.forEach((seam, row) => {
        const top = wall.y + row * 60;
        const bottom = top + 60;
        [[wall.x, seam], [seam, wall.x + wall.width]].forEach(([left, right]) => {
          const index = pieces.length;
          const points = `${left},${top} ${right},${top} ${right},${bottom} ${left},${bottom}`;
          const clipId = `crack-sample-piece-${index}`;
          const clip = svgElement('clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' });
          clip.append(svgElement('polygon', { points }));
          definitions.append(clip);

          const group = svgElement('g');
          group.style.transformOrigin = `${(left + right) / 2}px ${(top + bottom) / 2}px`;
          group.style.transformBox = 'view-box';
          group.style.transform = 'translate(0px, 0px) rotate(0deg)';
          group.append(svgElement('image', {
            href: textureUrl,
            x: wall.x - crop.x * scaleX,
            y: wall.y - crop.y * scaleY,
            width: 1420 * scaleX,
            height: 544 * scaleY,
            preserveAspectRatio: 'none',
            'clip-path': `url(#${clipId})`,
          }));
          group.append(svgElement('polygon', {
            points,
            fill: 'none',
            stroke: '#f653ce',
            'stroke-width': '1.5',
            'stroke-linejoin': 'round',
            'stroke-opacity': '0.92',
          }));
          svg.append(group);
          const landing = landings[index].slice();
          landing[1] -= 25;
          pieces.push({ group, landing });
        });
      });

      let shattered = false;
      let animations = [];
      const intactTransform = 'translate(0px, 0px) rotate(0deg)';
      const transformFor = ([x, y, rotation]) => `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

      function stopAnimations() {
        animations.forEach(animation => animation.cancel());
        animations = [];
      }

      function toggleFracture() {
        stopAnimations();
        shattered = !shattered;
        stage.classList.toggle('is-shattered', shattered);
        label.textContent = shattered ? 'Reset object' : 'Shatter it';
        status.textContent = shattered ? '8 pieces · released' : '8 pieces · ready to break';
        art.setAttribute('aria-label', shattered ? 'Reset the wall sample' : 'Shatter the wall sample');
        art.setAttribute('aria-pressed', String(shattered));
        toggle.setAttribute('aria-pressed', String(shattered));

        pieces.forEach(({ group, landing }, index) => {
          const restingTransform = transformFor(landing);
          const previous = group.style.transform;
          const target = shattered ? restingTransform : intactTransform;
          group.style.transform = target;
          if (reducedMotion.matches || typeof group.animate !== 'function') return;

          const [x, y, rotation] = landing;
          const keyframes = shattered
            ? [
                { transform: previous, offset: 0 },
                { transform: transformFor([x * 0.52, y * 0.1 - 25, rotation * 0.6]), offset: 0.32 },
                { transform: transformFor([x, y - 9, rotation * 1.04]), offset: 0.82 },
                { transform: target, offset: 1 },
              ]
            : [{ transform: previous }, { transform: target }];
          const animation = group.animate(keyframes, {
            duration: shattered ? 720 + (index % 3) * 45 : 430,
            easing: shattered ? 'cubic-bezier(.24,.55,.42,1)' : 'cubic-bezier(.2,.75,.25,1)',
            fill: 'none',
          });
          animations.push(animation);
        });
      }

      // Preserve the authored fallback until the image has successfully loaded.
      art.replaceChildren(svg);
      art.disabled = false;
      art.setAttribute('aria-pressed', 'false');
      art.setAttribute('aria-label', 'Shatter the wall sample');
      toggle.hidden = false;
      toggle.disabled = false;
      toggle.setAttribute('aria-pressed', 'false');
      status.textContent = '8 pieces · ready to break';
      art.addEventListener('click', toggleFracture);
      toggle.addEventListener('click', toggleFracture);
      if (typeof reducedMotion.addEventListener === 'function') {
        reducedMotion.addEventListener('change', event => {
          if (event.matches) stopAnimations();
        });
      }
    };
    texture.src = textureUrl;
  }

  function setupVideo() {
    const video = document.getElementById('demo-video');
    const play = document.getElementById('demo-play');
    if (!video || !play) return;

    video.controls = true;
    play.hidden = false;
    play.addEventListener('click', async () => {
      video.controls = true;
      play.hidden = true;
      try {
        await video.play();
      } catch {
        // Native controls keep download/playback options available if playback is blocked.
        video.focus();
      }
    });
    video.addEventListener('play', () => { play.hidden = true; });
  }

  function setupImageDialog() {
    const dialog = document.getElementById('image-dialog');
    const image = document.getElementById('dialog-image');
    const caption = document.getElementById('dialog-caption');
    const close = document.getElementById('dialog-close');
    if (!dialog || !image || !caption || !close || typeof dialog.showModal !== 'function') return;
    let opener = null;

    document.querySelectorAll('[data-enlarge]').forEach(button => {
      button.disabled = false;
      const hint = button.querySelector('.cp-enlarge__hint');
      if (hint) hint.hidden = false;
      button.addEventListener('click', event => {
        const source = button.dataset.enlarge;
        if (!source) return;
        event.preventDefault();
        opener = button;
        image.src = source;
        image.alt = button.dataset.caption || button.querySelector('img')?.alt || '';
        caption.textContent = button.dataset.caption || '';
        dialog.showModal();
        close.focus();
      });
    });

    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (opener && opener.isConnected) opener.focus();
    });
  }

  setupFracture();
  setupVideo();
  setupImageDialog();
})();
