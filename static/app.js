
(function() {
  'use strict';

  var app = {
    requestidx: 0,
    isLoading: true,
    visibleCards: {},
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
  };


  document.getElementById('butRefresh').addEventListener('click', function() {
    app.refresh();
  });

  document.getElementById('butAdd').addEventListener('click', function() {
    app.toggleAddDialog(true);
  });

  document.getElementById('photo-input').addEventListener('change', function(){
    if(document.getElementById('photo-input').files.length > 0){
    var photoInput = document.getElementById('photo-input');
    var file = photoInput.files[0];
    var formData = new FormData();
    formData.append('photo', file, file.name)
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/put', true);
    // TODO: add handler for onload
    xhr.send(formData)
    app.toggleAddDialog(false);
    }
  });

  document.getElementById('butAddCancel').addEventListener('click', function() {
    app.toggleAddDialog(false);
  });


  app.toggleAddDialog = function(visible) {
    app.refresh();
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  app.refresh = function() {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var chafagrams = JSON.parse(request.response);
          app.makeCards(chafagrams);
          if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
          }
        }
      }
    };
    request.open('GET', '/recent?id=' + app.requestidx);
    app.requestidx++;
    request.send();
  };

  app.makeCards = function(entries) {
    var cards = [];
    var container = document.getElementById('card-container');
    for (var i = 0; i < entries.length; i++) {
      var current = document.getElementById(entries[i].post_id);
      if(current) {
        continue;
      }
      cards.push(app.makeNewCard(entries[i]));
    }
    for (var i = cards.length - 1; i >= 0; i--){
      container.insertBefore(cards[i], container.childNodes[0]);
      cards[i].hidden = false;
    }
  };

  app.makeNewCard = function(entry) {
    var gs_url = 'https://storage.googleapis.com';
    var prototype = document.getElementById('prototype-card');
    var newCard = prototype.cloneNode(true);
    newCard.id = entry.post_id;
    newCard.querySelector('.photo').src = gs_url + entry.url;
    return newCard;
  }

  app.refresh();
})();
