import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Define core colors for the brand
const BG = "#111111";
const CREAM = "#F0EBE8";
const RED = "#C1272D";

// Main landing page component
export default function HouseCelestreLanding() {
  // Phase controls the sequence of animation and content reveal
  const [phase, setPhase] = useState("initial");

  // Ref to the SVG for red thread animation
  const svgRef = useRef(null);

  // Controls whether the Substack modal is visible
  const [showModal, setShowModal] = useState(false);

  // Timing constants in milliseconds
  const initialSilence = 1000;
  const threadDuration = 2800;
  const holdAfter = 1500;
  const autoCollapseDelay = 600;

  // Ensure page starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Setup SVG stroke animation lengths
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll("path.thread");
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len} ${len}`; // full length for drawing animation
      p.style.strokeDashoffset = `${len}`; // hide stroke initially
      p.style.transition = `stroke-dashoffset ${threadDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`; // smooth organic motion
    });
  }, []);

  // Initial silence before starting animation
  useEffect(() => {
    const timer = setTimeout(() => setPhase("animating"), initialSilence);
    return () => clearTimeout(timer);
  }, []);

  // Trigger SVG animation when phase becomes "animating"
  useEffect(() => {
    if (phase === "animating" && svgRef.current) {
      const paths = svgRef.current.querySelectorAll("path.thread");
      // Stagger the stroke animation for organic feel
      paths.forEach((p, i) => {
        setTimeout(() => { p.style.strokeDashoffset = "0"; }, i * 120);
      });
      const timer = setTimeout(() => setPhase("holding"), threadDuration + 220);
      return () => clearTimeout(timer);
    }
  }, [phase, threadDuration]);

  // After holding, collapse the mark toward top center
  useEffect(() => {
    if (phase === "holding") {
      const timer = setTimeout(() => setPhase("collapsed"), holdAfter + autoCollapseDelay);
      return () => clearTimeout(timer);
    }
  }, [phase, holdAfter, autoCollapseDelay]);

  // Allow user scroll/wheel/touch to trigger collapse during holding phase
  useEffect(() => {
    let touchStartY = 0;

    const onScroll = () => {
      if (window.scrollY > 10 && (phase === "holding" || phase === "animating")) {
        setPhase("collapsed");
      }
    };

    const onWheel = (e) => {
      // Trigger collapse on any downward scroll attempt during holding/animating phase
      if ((phase === "holding" || phase === "animating") && e.deltaY > 0) {
        setPhase("collapsed");
      }
    };

    const onTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      if (phase === "holding" || phase === "animating") {
        const touchY = e.touches[0].clientY;
        const deltaY = touchStartY - touchY;

        // Swipe up (scroll down gesture)
        if (deltaY > 50) {
          setPhase("collapsed");
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [phase]);

  // After collapse, reveal main content
  useEffect(() => {
    let t;
    if (phase === "collapsed") t = setTimeout(() => setPhase("revealed"), 600);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: BG }}>
      {/* Debug indicator - remove in production */}
      <div style={{ position: 'fixed', top: 10, right: 10, color: CREAM, fontSize: '12px', zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px' }}>
        Phase: {phase}
      </div>

      {/* Main visual viewport */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Red thread mark animation - always visible */}
        <motion.div
          initial={{ scale: 1, y: '-50%', x: '-50%' }}
          animate={
            phase === "collapsed" || phase === "revealed"
              ? { scale: 0.65, y: -window.innerHeight * 0.38, x: '-50%' }
              : { scale: 1, y: '-50%', x: '-50%' }
          }
          transition={{ type: "spring", stiffness: 60, damping: 18, duration: 0.9 }}
          style={{ transformOrigin: 'center center' }}
          className="absolute left-1/2 top-1/2"
        >
          <div className="flex items-center justify-center">
            <div style={{ width: phase === "collapsed" || phase === "revealed" ? '200px' : Math.min(window.innerWidth * 0.4, 280) }}>
              <svg ref={svgRef} viewBox="0 0 200 220" className="w-full h-auto mx-auto" role="img" aria-label="House Celestre mark">
                {/* Red dot that starts animation */}
                <motion.circle cx="100" cy="110" r={phase === "initial" ? 0 : 4} animate={{ opacity: phase === "initial" ? 0 : 1 }} transition={{ delay: initialSilence / 1000, duration: 0.25 }} fill={RED} />

                {/* Thread paths forming chalice/cup design */}
                {/* Left curved side of chalice */}
                <path className="thread" d="M 50 40 Q 45 80, 50 120 L 70 140" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Right curved side of chalice */}
                <path className="thread" d="M 150 40 Q 155 80, 150 120 L 130 140" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Base horizontal connection */}
                <path className="thread" d="M 70 140 L 130 140" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Vertical stem */}
                <path className="thread" d="M 100 140 L 100 180" fill="none" stroke={RED} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Main content revealed after collapse */}
        {phase === "revealed" && (
          <div className="absolute inset-0 flex flex-col justify-center items-center px-6">
            <div className="w-full max-w-3xl mx-auto text-center" style={{ marginTop: '20vh' }}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <h1 style={{ fontFamily: "Playfair Display, serif", color: CREAM }} className="text-4xl md:text-5xl lg:text-6xl leading-tight mb-1">
                  Time slows here.
                </h1>

                {/* Invitation button */}
                <motion.div initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.45 }} className="mt-12">
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-10 py-4 rounded-sm text-sm md:text-base tracking-wider font-medium"
                    style={{
                      backgroundColor: CREAM,
                      color: BG,
                      letterSpacing: '0.15em',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500
                    }}
                  >
                    REQUEST INVITATION
                  </button>
                </motion.div>

                {/* Footer with social icons */}
                <motion.footer
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="mt-10 md:mt-14"
                >
                  <div className="flex items-center justify-center gap-10 md:gap-12">
                    {/* Instagram Icon */}
                    <a href="https://instagram.com/housecelestre" aria-label="Instagram" target="_blank" rel="noreferrer">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>

                    {/* Substack Icon */}
                    <a href="https://housecelestre.substack.com/" aria-label="Substack" target="_blank" rel="noreferrer">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                      </svg>
                    </a>

                    {/* Email Icon */}
                    <a href="mailto:hello@housecelestre.com" aria-label="Email">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </a>
                  </div>
                </motion.footer>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      {/* Substack Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ backgroundColor: 'rgba(17, 17, 17, 0.85)' }}
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="relative w-full max-w-md bg-black rounded-lg p-8"
            style={{ border: `1px solid ${CREAM}20` }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-2xl"
              style={{ color: CREAM, opacity: 0.6 }}
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Modal content */}
            <div className="text-center mb-6">
              <h2 style={{ fontFamily: "Playfair Display, serif", color: CREAM, fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                Request Invitation
              </h2>
              <p style={{ color: CREAM, opacity: 0.8, fontSize: '0.875rem' }}>
                Join the House Celestre mailing list
              </p>
            </div>

            {/* Substack Embed */}
            <iframe
              src="https://housecelestre.substack.com/embed"
              width="100%"
              height="320"
              style={{ border: 'none', background: 'transparent' }}
              frameBorder="0"
              scrolling="no"
              title="Substack subscription form"
            />

            {/* Fallback link */}
            <div className="text-center mt-4">
              <p style={{ color: CREAM, opacity: 0.6, fontSize: '0.75rem' }}>
                Having trouble?{' '}
                <a
                  href="https://housecelestre.substack.com/subscribe"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: RED, textDecoration: 'underline' }}
                >
                  Open in new tab
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}