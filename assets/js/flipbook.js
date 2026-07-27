/* =====================================================================
   Flipbook viewer — renders a PDF into a two-page spread with a page-turn
   animation. Extracted from index.html so index.html and code-crafting.html
   share one implementation.

   Usage:  createFlipbook(triggerElementId, coverImageUrl, pdfUrl)

   The trigger is any element with that id (normally a .book-cover). If no
   such element exists on the page the call is a no-op, so a page can list
   flipbooks for covers it does not happen to show.
   ===================================================================== */

'use strict';

pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function createFlipbook(triggerId, coverUrl, pdfUrl) {
    const trigger = document.getElementById(triggerId);
    if (!trigger) return;

    const modal = document.createElement('div');
    modal.className = 'flip-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Flipbook viewer');
    modal.innerHTML =
        '<div class="flip-inner">' +
          '<button class="flip-close" aria-label="Close">\xd7</button>' +
          '<div class="flip-loading">' +
            '<div class="flip-prog-track"><div class="flip-prog-bar"></div></div>' +
            '<span class="flip-loading-msg">Loading…</span>' +
          '</div>' +
          '<div class="flip-book-wrap">' +
            '<div class="flip-spread">' +
              '<div class="flip-page flip-pl flip-blank"><span class="flip-pnum"></span></div>' +
              '<div class="flip-spine"></div>' +
              '<div class="flip-page flip-pr"><span class="flip-pnum"></span></div>' +
            '</div>' +
            '<div class="flip-controls">' +
              '<button class="flip-nav" disabled>← Prev</button>' +
              '<span class="flip-info">1 / 1</span>' +
              '<button class="flip-nav">Next →</button>' +
            '</div>' +
          '</div>' +
        '</div>';
    document.body.appendChild(modal);

    const loadDiv  = modal.querySelector('.flip-loading');
    const bookWrap = modal.querySelector('.flip-book-wrap');
    const progEl   = modal.querySelector('.flip-prog-bar');
    const msgEl    = modal.querySelector('.flip-loading-msg');
    const fSpread  = modal.querySelector('.flip-spread');
    const pl       = modal.querySelector('.flip-pl');
    const pr       = modal.querySelector('.flip-pr');
    const spineEl  = modal.querySelector('.flip-spine');
    const navBtns  = modal.querySelectorAll('.flip-nav');
    const prevBtn  = navBtns[0];
    const nextBtn  = navBtns[1];
    const infoEl   = modal.querySelector('.flip-info');
    const pnums    = modal.querySelectorAll('.flip-pnum');
    const lnum     = pnums[0];
    const rnum     = pnums[1];

    const pages  = [];
    let spread   = 0;
    let nSpreads = 0;
    let flipAnim = false;
    let loaded   = false;

    function openModal()  { modal.classList.add('open');    document.body.style.overflow = 'hidden'; if (!loaded) loadPages(); }
    function closeModal() { modal.classList.remove('open'); document.body.style.overflow = ''; }

    trigger.addEventListener('click', openModal);
    trigger.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(); });
    modal.querySelector('.flip-close').addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', e => {
        if (!modal.classList.contains('open')) return;
        if (e.key === 'Escape')                              closeModal();
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') flipForward();
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   flipBack();
    });
    prevBtn.addEventListener('click', () => flipBack());
    nextBtn.addEventListener('click', () => flipForward());

    async function loadPages() {
        loadDiv.style.display  = 'flex';
        bookWrap.style.display = 'none';
        pages.push(coverUrl);

        msgEl.textContent = 'Loading PDF…';
        const buf = await fetch(pdfUrl).then(r => r.arrayBuffer());
        msgEl.textContent = 'Parsing…';
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        const n   = pdf.numPages;

        const p1  = await pdf.getPage(1);
        const vp1 = p1.getViewport({ scale: 1 });
        const maxH = Math.round(window.innerHeight * 0.72);
        const maxW = Math.round((window.innerWidth * 0.82) / 2);
        const s   = Math.min(maxH / vp1.height, maxW / vp1.width, 1.8);
        const vps = p1.getViewport({ scale: s });
        document.documentElement.style.setProperty('--fpw', Math.round(vps.width)  + 'px');
        document.documentElement.style.setProperty('--fph', Math.round(vps.height) + 'px');

        for (let i = 1; i <= n; i++) {
            msgEl.textContent = 'Rendering ' + i + ' / ' + n + '…';
            progEl.style.width = ((i / n) * 100) + '%';
            const page = await pdf.getPage(i);
            const vp   = page.getViewport({ scale: s });
            const cv   = document.createElement('canvas');
            cv.width   = Math.round(vp.width);
            cv.height  = Math.round(vp.height);
            await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
            pages.push(cv.toDataURL('image/jpeg', 0.93));
        }

        loaded   = true;
        nSpreads = 1 + Math.ceil(Math.max(pages.length - 1, 0) / 2);
        spread   = 0;
        renderSpread();
        loadDiv.style.display  = 'none';
        bookWrap.style.display = 'flex';
    }

    function getSpread(idx) {
        if (idx === 0) return [null, pages[0]];
        return [pages[2 * idx - 1] || null, pages[2 * idx] || null];
    }

    function renderSpread() {
        const [l, r] = getSpread(spread);
        setPage(pl, l);
        setPage(pr, r);
        lnum.textContent = (spread > 0 && pages[2 * spread - 1]) ? String(2 * spread - 1) : '';
        rnum.textContent = spread === 0 ? 'Cover' : (pages[2 * spread] ? String(2 * spread) : '');
        prevBtn.disabled = spread === 0;
        nextBtn.disabled = spread >= nSpreads - 1;
        infoEl.textContent = (spread + 1) + ' / ' + nSpreads;
    }

    function setPage(el, src) {
        const numEl = el.querySelector('.flip-pnum');
        el.innerHTML = '';
        el.appendChild(numEl);
        if (src) {
            el.classList.remove('flip-blank');
            const img = new Image();
            img.src = src;
            el.insertBefore(img, numEl);
        } else {
            el.classList.add('flip-blank');
        }
    }

    function flipForward() {
        if (flipAnim || spread >= nSpreads - 1) return;
        const [, curR] = getSpread(spread);
        const [nL, nR] = getSpread(spread + 1);
        doFlip('forward', curR, nL, nR, () => { spread++; renderSpread(); });
    }

    function flipBack() {
        if (flipAnim || spread <= 0) return;
        const [curL]   = getSpread(spread);
        const [pL, pR] = getSpread(spread - 1);
        doFlip('backward', curL, pR, pL, () => { spread--; renderSpread(); });
    }

    function doFlip(dir, frontSrc, backSrc, otherSrc, onDone) {
        flipAnim = true;
        const sW = spineEl.offsetWidth || 10;
        const lW = pl.offsetWidth;
        const rW = pr.offsetWidth;

        const leaf = document.createElement('div');
        leaf.className = 'flip-leaf';
        if (dir === 'forward') {
            leaf.style.left = (lW + sW) + 'px';
            leaf.style.width = rW + 'px';
            leaf.style.transformOrigin = '0 50%';
        } else {
            leaf.style.left  = '0';
            leaf.style.width = (lW || rW) + 'px';
            leaf.style.transformOrigin = '100% 50%';
        }

        leaf.appendChild(makeFace(frontSrc, false));
        leaf.appendChild(makeFace(backSrc,  true));

        const sL = makeShade('to right');
        const sR = makeShade('to left');
        pl.appendChild(sL);
        pr.appendChild(sR);

        if (dir === 'forward') setPage(pr, otherSrc);
        else                   setPage(pl, otherSrc);

        fSpread.appendChild(leaf);

        requestAnimationFrame(() => requestAnimationFrame(() => {
            leaf.style.transition = 'transform 0.65s cubic-bezier(0.42,0,0.28,1)';
            sL.style.opacity = '0.5';
            sR.style.opacity = '0.5';
            leaf.style.transform = dir === 'forward' ? 'rotateY(-180deg)' : 'rotateY(180deg)';
        }));

        setTimeout(() => {
            if (dir === 'forward') setPage(pl, backSrc);
            else                   setPage(pr, backSrc);
            leaf.remove(); sL.remove(); sR.remove();
            flipAnim = false;
            onDone();
        }, 680);
    }

    function makeFace(src, isBack) {
        const d = document.createElement('div');
        d.className = 'flip-face' + (isBack ? ' flip-face-back' : '');
        if (src) { const img = new Image(); img.src = src; d.appendChild(img); }
        else { d.style.background = 'linear-gradient(110deg,#f4f0e8,#e8e2d4)'; }
        return d;
    }

    function makeShade(dir) {
        const d = document.createElement('div');
        d.className = 'flip-shade';
        d.style.background = 'linear-gradient(' + dir + ',transparent 0%,rgba(0,0,0,0.2) 100%)';
        return d;
    }
}
