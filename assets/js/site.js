/* Scroll-triggered reveal for anything marked .fade-in-up. Loaded by every
   page; the flipbook (assets/js/flipbook.js) is loaded only where needed. */

(function () {
    'use strict';

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
}());
