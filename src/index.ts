import * as xb from 'xrblocks';
import { KenyaCreatesSpatialScene } from './components/spatialScene';
import { UIManager } from './components/uiManager';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Mount 2D Web Platform UI
  const ui = new UIManager();
  ui.mount();

  // 2. Setup 3D Spatial Dome Mode Toggle
  const toggleBtn = document.getElementById('btnToggle3DMode');
  const toggleLabel = document.getElementById('spatialBtnLabel');
  let is3DMode = false;

  if (toggleBtn && toggleLabel) {
    toggleBtn.addEventListener('click', () => {
      is3DMode = !is3DMode;
      document.body.classList.toggle('spatial-dome-mode', is3DMode);
      if (is3DMode) {
        toggleLabel.textContent = 'Return to Web Platform 📋';
      } else {
        toggleLabel.textContent = 'Enter 3D Spatial Dome 🪐';
      }
    });
  }

  // 3. Motion Entrance Completion Listener & Reduced Motion Sync
  (function initMotionEffects() {
    const root = document.documentElement;
    const foot2 = document.getElementById('foot2');
    let timer: any;

    function done() {
      if (timer) clearTimeout(timer);
      if (foot2) foot2.removeEventListener('animationend', done);
      root.classList.add('is-entered');
    }

    if (foot2) {
      foot2.addEventListener('animationend', done);
    }
    timer = setTimeout(done, 4000);

    // Sync background video with prefers-reduced-motion
    const q = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)');
    const v = document.querySelector('video.art') as HTMLVideoElement | null;
    if (q && v) {
      const syncVideo = () => {
        if (q.matches) {
          v.pause();
        } else {
          const p = v.play();
          if (p) p.catch(() => {});
        }
      };
      syncVideo();
      if (q.addEventListener) {
        q.addEventListener('change', syncVideo);
      } else if ((q as any).addListener) {
        (q as any).addListener(syncVideo);
      }
    }
  })();

  // 4. Initialize XR Blocks 3D Spatial Exhibition
  const spatialScene = new KenyaCreatesSpatialScene();
  xb.add(spatialScene);

  const options = new xb.Options();
  options.setAppTitle('Kenya Creates');
  options.setAppDescription(
    "Kenya's national digital platform for showcasing ideas, innovations, startups, research, and creative projects across all 47 counties."
  );
  options.enableReticles();

  try {
    await xb.init(options);
  } catch (err) {
    console.warn('XRBlocks initialization notice:', err);
  }
});
