import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from 'react';
import type { FullTripItinerary } from "../types/travel";

interface NavbarProps {
  currentView: 'planner' | 'saved' | 'profile';
  onViewChange: (view: 'planner' | 'saved' | 'profile') => void;
  tripData?: FullTripItinerary | null;
  onSaveTrip?: () => void;
  isSaving?: boolean;
  saveMessage?: string;
  isSaved?: boolean;
  isSharedView?: boolean;
  onSaveSharedTrip?: () => void;
  onExitShareView?: () => void;
  isOffline?: boolean;
}

export default function Navbar({
  currentView,
  onViewChange,
  tripData,
  onSaveTrip,
  isSaving,
  saveMessage,
  isSaved = false,
  isSharedView = false,
  onSaveSharedTrip,
  onExitShareView,
  isOffline = false,
}: NavbarProps) {
  const [user] = useAuthState(auth);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleCopyLink = () => {
    if (!tripData) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?share=${tripData.id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNavChange = (view: 'planner' | 'saved' | 'profile') => {
    onViewChange(view);
    closeMobileMenu();
  };

  return (
    <>
      <nav className="navbar no-print">
        {/* Brand / Logo */}
        <div
          className="navbar-brand"
          onClick={() => {
            if (isSharedView && onExitShareView) {
              onExitShareView();
            } else {
              onViewChange('planner');
            }
            closeMobileMenu();
          }}
        >
          <div className="navbar-logo-icon">🌍</div>
          <span className="navbar-brand-text">AI Travel Guide</span>
          {isOffline && <span className="offline-badge">Offline</span>}
        </div>

        {/* Center Navigation Tabs — desktop only, hidden during shared view */}
        {user && !isSharedView && (
          <div className="navbar-center">
            <button
              className={`nav-tab ${currentView === 'planner' ? 'active' : ''}`}
              onClick={() => onViewChange('planner')}
            >
              ✈️ Plan Trip
            </button>
            <button
              className={`nav-tab ${currentView === 'saved' ? 'active' : ''}`}
              onClick={() => onViewChange('saved')}
            >
              📂 My Trips
            </button>
            <button
              className={`nav-tab ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => onViewChange('profile')}
            >
              👤 Profile
            </button>
          </div>
        )}

        {/* Right Side Actions */}
        <div className="navbar-right">

          {/* Shared View Actions — desktop only */}
          {isSharedView && tripData && (
            <div className="navbar-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {saveMessage && (
                <span className="save-msg">{saveMessage}</span>
              )}
              <button
                className="save-trip-btn"
                onClick={onSaveSharedTrip}
                disabled={isSaving}
              >
                {isSaving ? <>⏳ Saving...</> : <>💾 Save to My Trips</>}
              </button>
              <button className="nav-tab active" style={{ height: '36px', padding: '0 16px' }} onClick={handleCopyLink}>
                {copied ? 'Copied! 🔗' : '🔗 Copy Link'}
              </button>
              <button className="nav-tab" style={{ height: '36px', padding: '0 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => window.print()}>
                📄 Export PDF
              </button>
              <button className="signout-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)' }} onClick={onExitShareView}>
                🛫 Plan My Own
              </button>
            </div>
          )}

          {/* Regular View Actions — desktop only */}
          {!isSharedView && tripData && currentView === 'planner' && (
            <div className="navbar-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {saveMessage && (
                <span className="save-msg">{saveMessage}</span>
              )}
              {isSaved ? (
                <>
                  <button className="nav-tab active" style={{ height: '36px', padding: '0 16px' }} onClick={handleCopyLink}>
                    {copied ? 'Copied! 🔗' : '🔗 Share Link'}
                  </button>
                  <button className="nav-tab" style={{ height: '36px', padding: '0 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => window.print()}>
                    📄 Export PDF
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="save-trip-btn"
                    onClick={onSaveTrip}
                    disabled={isSaving}
                  >
                    {isSaving ? <>⏳ Saving...</> : <>💾 Save Trip</>}
                  </button>
                  <button className="nav-tab" style={{ height: '36px', padding: '0 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => window.print()}>
                    📄 Export PDF
                  </button>
                </>
              )}
            </div>
          )}

          {user ? (
            <>
              {/* User Avatar — always visible */}
              <img
                src={
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=0ea5e9&color=fff`
                }
                alt={user.displayName || 'User'}
                className="user-avatar"
                title={user.displayName || user.email || 'User'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=0ea5e9&color=fff`;
                }}
              />
              {/* Sign Out — desktop only */}
              <button className="signout-btn navbar-desktop-only" onClick={() => signOut(auth)}>
                Sign Out
              </button>
            </>
          ) : (
            /* Sign In button */
            !isSharedView && (
              <button className="signin-btn" onClick={handleLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="signin-btn-text">Sign in with Google</span>
              </button>
            )
          )}

          {/* Hamburger Button — mobile only */}
          {(user || isSharedView) && (
            <button
              className="hamburger-btn"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className={`hamburger-icon ${mobileMenuOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Slide-Down Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu no-print" onClick={closeMobileMenu}>
          <div className="mobile-nav-inner" onClick={e => e.stopPropagation()}>

            {/* Nav Tabs */}
            {user && !isSharedView && (
              <div className="mobile-nav-section">
                <p className="mobile-nav-label">Navigate</p>
                <button
                  className={`mobile-nav-item ${currentView === 'planner' ? 'active' : ''}`}
                  onClick={() => handleNavChange('planner')}
                >
                  ✈️ Plan Trip
                </button>
                <button
                  className={`mobile-nav-item ${currentView === 'saved' ? 'active' : ''}`}
                  onClick={() => handleNavChange('saved')}
                >
                  📂 My Trips
                </button>
                <button
                  className={`mobile-nav-item ${currentView === 'profile' ? 'active' : ''}`}
                  onClick={() => handleNavChange('profile')}
                >
                  👤 Profile
                </button>
              </div>
            )}

            {/* Trip Actions */}
            {!isSharedView && tripData && currentView === 'planner' && (
              <div className="mobile-nav-section">
                <p className="mobile-nav-label">Trip Actions</p>
                {saveMessage && <span className="save-msg" style={{ display: 'block', marginBottom: '8px' }}>{saveMessage}</span>}
                {isSaved ? (
                  <>
                    <button className="mobile-nav-item" onClick={() => { handleCopyLink(); closeMobileMenu(); }}>
                      🔗 {copied ? 'Copied!' : 'Share Link'}
                    </button>
                    <button className="mobile-nav-item" onClick={() => { window.print(); closeMobileMenu(); }}>
                      📄 Export PDF
                    </button>
                  </>
                ) : (
                  <>
                    <button className="mobile-nav-item accent" onClick={() => { onSaveTrip?.(); closeMobileMenu(); }} disabled={isSaving}>
                      {isSaving ? '⏳ Saving...' : '💾 Save Trip'}
                    </button>
                    <button className="mobile-nav-item" onClick={() => { window.print(); closeMobileMenu(); }}>
                      📄 Export PDF
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Shared View Actions */}
            {isSharedView && tripData && (
              <div className="mobile-nav-section">
                <p className="mobile-nav-label">Actions</p>
                <button className="mobile-nav-item accent" onClick={() => { onSaveSharedTrip?.(); closeMobileMenu(); }} disabled={isSaving}>
                  {isSaving ? '⏳ Saving...' : '💾 Save to My Trips'}
                </button>
                <button className="mobile-nav-item" onClick={() => { handleCopyLink(); closeMobileMenu(); }}>
                  🔗 {copied ? 'Copied!' : 'Copy Link'}
                </button>
                <button className="mobile-nav-item" onClick={() => { window.print(); closeMobileMenu(); }}>
                  📄 Export PDF
                </button>
                <button className="mobile-nav-item" onClick={() => { onExitShareView?.(); closeMobileMenu(); }}>
                  🛫 Plan My Own
                </button>
              </div>
            )}

            {/* Account */}
            {user && (
              <div className="mobile-nav-section">
                <p className="mobile-nav-label">Account</p>
                <div className="mobile-nav-user">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=0ea5e9&color=fff`}
                    alt={user.displayName || 'User'}
                    className="mobile-nav-avatar"
                  />
                  <span className="mobile-nav-username">{user.displayName || user.email}</span>
                </div>
                <button className="mobile-nav-item danger" onClick={() => { signOut(auth); closeMobileMenu(); }}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {mobileMenuOpen && (
        <div className="mobile-nav-backdrop no-print" onClick={closeMobileMenu} />
      )}
    </>
  );
}