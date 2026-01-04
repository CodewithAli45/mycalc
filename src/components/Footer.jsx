export default function Footer() {
  return (
    <footer className="app-footer">
      <p>
        Developed with <span style={{ color: 'red' }}>❤️</span> - <span className="signature">Ali Murtaza</span>
      </p>
      <p className="copyright">&copy; {new Date().getFullYear()} All Rights Reserved</p>
    </footer>
  );
}
