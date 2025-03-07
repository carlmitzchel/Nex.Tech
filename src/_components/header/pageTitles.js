const getPageTitle = (pathname) => {
  switch (pathname) {
    case "/":
      return "Home";
    case "/books":
      return "Books Catalog";
    case "/borrowform":
      return "Borrow Request Form";
    case "/reserveform":
      return "Reserve Request Form"
    case "/games":
      return "Games Catalog";
    case "/dashboard":
      return "Dashboard";
    case "/dbpage":
      return "Database";
    case "/landing":
      return "Home";
    case "/qrscanner":
      return "QR Scanner";
    case "/reports":
      return "Reports";
    default:
      return "Default Title"; // Replace with your default title
  }
};

export default getPageTitle;
