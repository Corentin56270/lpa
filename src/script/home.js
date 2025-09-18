document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("banner");
  const menu = document.getElementById("menu");

  // Toggle du menu principal
  banner.addEventListener("click", () => {
    menu.classList.toggle("open");
  });

  // Toggle des sous-menus
  document.querySelectorAll(".toggle-submenu").forEach(button => {
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // pour ne pas fermer le menu principal
      const submenu = button.nextElementSibling;
      submenu.classList.toggle("open");
    });
  });
});
