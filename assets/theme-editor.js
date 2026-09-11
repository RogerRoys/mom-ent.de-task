function hidePopupAll() {
  const Popup = document.querySelector('.popup--overlay');
  Popup.classList.add('hide-in-editor');
  popup.classList.remove('show-in-editor');
}

function hidePopup(event) {
  const popup = document.querySelector('.popup--overlay');
  if (!popup) return; // Check if the popup exists

  // Check if the selected section contains the popup
  if (!event.target.contains(popup)) {
    popup.classList.add('hide-in-editor');
    popup.classList.remove('show-in-editor');
  } else {
    popup.classList.remove('hide-in-editor'); // Ensure the class is removed if the section contains the popup
    popup.classList.add('show-in-editor'); // Ensure the class is removed if the section contains the popup
  }
}

document.addEventListener('shopify:section:select', (event) => hidePopup(event));

document.addEventListener('shopify:section:deselect', (event) => hidePopupAll(event));

document.addEventListener('shopify:section:load', (event) => hidePopup(event));
