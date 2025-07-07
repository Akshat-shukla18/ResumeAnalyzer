import { useState, useEffect } from "react";
import Lenis from '@studio-freight/lenis';

// Component imports
import ButtonGradient from "./assets/svg/ButtonGradient";
import Benefits from "./components/Benefits";
import Collaboration from "./components/Collaboration";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Roadmap from "./components/Roadmap";
import Services from "./components/Services";
import UploadResumeModal from "./components/UploadResumeModal";
import ResumeAnalyzer from './components/ResumeAnalyzer';
import AuthForm from "./components/AuthForm";

const App = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [username, setUsername] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Load username
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // ✅ Lenis smooth scroll + anchor scroll setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 2.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: true,
      gestureOrientation: "vertical",
      direction: "vertical",
      lerp: 0.07,
    });

    // requestAnimationFrame loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // ✅ Handle anchor links with lenis.scrollTo
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, {
            offset: -50, // adjust based on your fixed header
            duration: 1.5,
          });
        }
      });
    });

    return () => lenis.destroy();
  }, []);

  // Auth handlers
  const openAuthModal = () => setShowAuthForm(true);
  const closeAuthModal = () => setShowAuthForm(false);

  const openUploadModal = () => setShowUploadModal(true);
  const closeUploadModal = () => setShowUploadModal(false);

  const handleSignIn = (user) => {
    console.log("handleSignIn called with user:", user);
    setUsername(user.username);
    localStorage.setItem("username", user.username);
    closeAuthModal();
  };

  const handleSignOut = () => {
    setUsername(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <>
      <div className={`pt-[4.75rem] lg:pt-[5.25rem] ${showUploadModal ? "pointer-events-none select-none" : ""}`}>
        <Header openAuthModal={openAuthModal} username={username} handleSignOut={handleSignOut} hideNavbar={showUploadModal} />
        <Hero openAuthModal={openAuthModal} />
        <Benefits />
        <Collaboration openAuthModal={openAuthModal} username={username} />
        <Services />
        <Roadmap />
        <Footer />
      </div>

      <ButtonGradient />

      {showAuthForm && <AuthForm onClose={closeAuthModal} onSignIn={handleSignIn} />}
      <UploadResumeModal isOpen={showUploadModal} onClose={closeUploadModal} />
    </>
  );
};

export default App;
