var langselectortoggle = document.getElementById('langSelectorOpener');
var langselectorpanel = document.getElementById('langSelectorPanel');
var langselectorpanelbg = document.getElementById('langSelectorPanelBg');  
var langselectorclose = document.getElementById('langSelectorCloseBtn'); 
var langselectortoggleInDrawer = document.getElementById('langSelectorOpenerDrawer');
var langselectortoggleInHeader = document.getElementById('langSelectorOpenerHeader');

if(langselectortoggle) {
  langselectortoggle.addEventListener('click', function() {
    langselectorpanel.classList.add('open');
    langselectorpanelbg.classList.add('open');
    event.preventDefault();
  });  
}

if(langselectortoggleInDrawer && langselectorpanel) {
  langselectortoggleInDrawer.addEventListener('click', function() {
    langselectorpanel.classList.add('open');
    langselectorpanelbg.classList.add('open');
  });  
}

if(langselectortoggleInHeader && langselectorpanel) {
  langselectortoggleInHeader.addEventListener('click', function() {
    langselectorpanel.classList.add('open');
    langselectorpanelbg.classList.add('open');
  });  
}

langselectorclose.addEventListener('click', function() {
  langselectorpanel.classList.remove('open');
  langselectorpanelbg.classList.remove('open');
  event.preventDefault();
});

langselectorpanelbg.addEventListener('click', function() {
  this.classList.remove('open');
  langselectorpanel.classList.remove('open');
});
