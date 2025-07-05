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

import { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";

const App = () => {
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [username, setUsername] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    // Load username from localStorage on app start
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const openAuthModal = () => setShowAuthForm(true);
  const closeAuthModal = () => setShowAuthForm(false);

  const openUploadModal = () => setShowUploadModal(true);
  const closeUploadModal = () => setShowUploadModal(false);

  // Function to handle successful sign-in and set username
  const handleSignIn = (user) => {
    console.log("handleSignIn called with user:", user);
    setUsername(user.username);
    localStorage.setItem("username", user.username);
    closeAuthModal();
  };

  // Function to handle sign-out
  const handleSignOut = () => {
    setUsername(null);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
  };

  return (
    <>
      <div className={`pt-[4.75rem] lg:pt-[5.25rem] overflow-hidden ${showUploadModal ? "pointer-events-none select-none" : ""}`}>
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
