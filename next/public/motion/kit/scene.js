/* =============================================================================
   QBIX MOTION — a scene box, as components/scene/Scene.tsx lays one out:
   the drawing is built at its own size (w × h, its own px) and zoomed to fit
   its box (zoom, not a transform, so hairlines and type stay sharp). Elements
   the timeline moves are named with data-k. Hidden until its timeline is
   built, so nothing flashes in its final place first.

     const { tl, q } = QM.scene(box, { w: 720, h: 540, n: 3, build(q, tl) { … } });
     QM.demo({ kind: 'states', n: 3, seek: (t) => tl.seek(t) });
   ============================================================================= */
(function () {
  const QM = (window.QM = window.QM || {});
  QM.scene = (box, { w = 720, h = 540, n = 1, build }) => {
    const scn = box.querySelector('.scn');
    scn.style.width = `${w}px`;
    scn.style.height = `${h}px`;
    const fit = () => {
      const k = Math.min(box.clientWidth / w, box.clientHeight / h);
      if (k > 0) scn.style.setProperty('zoom', String(Math.round(k * 1000) / 1000));
    };
    fit();
    new ResizeObserver(fit).observe(box);
    const q = (k) => scn.querySelector(`[data-k="${k}"]`);
    q.all = (prefix) => Array.from(scn.querySelectorAll(`[data-k^="${prefix}"]`));
    const tl = new window.QMTimeline.Timeline(n);
    build(q, tl);
    tl.build(0);
    scn.classList.add('is-ready');
    return { tl, q, scn };
  };
})();
