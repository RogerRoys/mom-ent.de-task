window.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll('.tab-button');
  const tabList = document.querySelector('.tab-menu');

  // Add a click event handler to each tab
  tabs.forEach((tab) => {
    tab.addEventListener("click", changeTabs);
  });

  // Enable arrow navigation between tabs in the tab list
  let tabFocus = 0;

  tabList.addEventListener("keydown", (e) => {
    // Move right
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      tabs[tabFocus].setAttribute("tabindex", -1);
      if (e.key === 'ArrowRight') {
        tabFocus++;
        // If we're at the end, go to the start
        if (tabFocus >= tabs.length) {
          tabFocus = 0;
        }
        // Move left
      } else if (e.key === 'ArrowLeft') {
        tabFocus--;
        // If we're at the start, move to the end
        if (tabFocus < 0) {
          tabFocus = tabs.length - 1;
        }
      }

      tabs[tabFocus].setAttribute("tabindex", 0);
      tabs[tabFocus].focus();
    }
  });
});

function changeTabs(e) {
  const target = e.target;
  const tabId = target.getAttribute("aria-controls");
  const grandparent = target.closest('.tab-grand');

  // Remove all current selected tabs
  grandparent
    .querySelectorAll('[aria-selected="true"]')
    .forEach((t) => {
      t.setAttribute("aria-selected", false);
      t.setAttribute("tabindex", -1);
    });

  // Set this tab as selected
  target.setAttribute("aria-selected", true);
  target.setAttribute("tabindex", 0);

  // Hide all tab panels
  grandparent
    .querySelectorAll('.tab-content')
    .forEach((p) => p.setAttribute("hidden", true));

  // Show the selected panel
  const selectedPanel = grandparent.querySelector(`#${CSS.escape(tabId)}`);
  if (selectedPanel) {
    selectedPanel.removeAttribute("hidden");
  }
}
