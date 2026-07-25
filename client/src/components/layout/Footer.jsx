const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-300 text-base-content p-4">
      <aside>
        <p>© {new Date().getFullYear()} FamilyConnect. All rights reserved.</p>
      </aside>
    </footer>
  );
};

export default Footer;