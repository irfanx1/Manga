import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

const HomeIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
const ExploreIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"/></svg>;
const LibraryIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>;
const HistoryIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>;
const UserIcon = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

export default function BottomNav() {
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({isActive}) => `bnav-item ${isActive ? 'active' : ''}`}>
        <HomeIcon /><span>Home</span>
      </NavLink>
      <NavLink to="/explore" className={({isActive}) => `bnav-item ${isActive ? 'active' : ''}`}>
        <ExploreIcon /><span>Explore</span>
      </NavLink>
      <NavLink to="/library" className={({isActive}) => `bnav-item ${isActive ? 'active' : ''}`}>
        <LibraryIcon /><span>Library</span>
      </NavLink>
      <NavLink to="/history" className={({isActive}) => `bnav-item ${isActive ? 'active' : ''}`}>
        <HistoryIcon /><span>History</span>
      </NavLink>
      <NavLink to={user ? '/profile' : '/login'} className={({isActive}) => `bnav-item ${isActive ? 'active' : ''}`}>
        <UserIcon /><span>Profile</span>
      </NavLink>
    </nav>
  );
}
