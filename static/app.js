
(function() {
  'use strict';

  // Insert injected weather forecast here


  var app = {
    isLoading: true,
    visibleCards: {},
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('butRefresh').addEventListener('click', function() {
    // Refresh all of the forecasts
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


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function(data) {
    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.location').textContent = data.label;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }
    card.querySelector('.description').textContent = data.currently.summary;
    card.querySelector('.date').textContent =
      new Date(data.currently.time * 1000);
    card.querySelector('.current .icon').classList.add(data.currently.icon);
    card.querySelector('.current .temperature .value').textContent =
      Math.round(data.currently.temperature);
    card.querySelector('.current .feels-like .value').textContent =
      Math.round(data.currently.apparentTemperature);
    card.querySelector('.current .precip').textContent =
      Math.round(data.currently.precipProbability * 100) + '%';
    card.querySelector('.current .humidity').textContent =
      Math.round(data.currently.humidity * 100) + '%';
    card.querySelector('.current .wind .value').textContent =
      Math.round(data.currently.windSpeed);
    card.querySelector('.current .wind .direction').textContent =
      data.currently.windBearing;
    var nextDays = card.querySelectorAll('.future .oneday');
    var today = new Date();
    today = today.getDay();
    for (var i = 0; i < 7; i++) {
      var nextDay = nextDays[i];
      var daily = data.daily.data[i];
      if (daily && nextDay) {
        nextDay.querySelector('.date').textContent =
          app.daysOfWeek[(i + today) % 7];
        nextDay.querySelector('.icon').classList.add(daily.icon);
        nextDay.querySelector('.temp-high .value').textContent =
          Math.round(daily.temperatureMax);
        nextDay.querySelector('.temp-low .value').textContent =
          Math.round(daily.temperatureMin);
      }
    }
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };


  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  // Gets a forecast for a specific city and update the card with the data
  app.getForecast = function(key, label) {
    var url = 'https://publicdata-weather.firebaseio.com/';
    url += key + '.json';
    // Make the XHR to get the data, then update the card
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          response.key = key;
          response.label = label;
          app.hasRequestPending = false;
          app.updateForecastCard(response);
        }
      }
    };
    request.open('GET', url);
    request.send();
  };

  app.display= function() {
    //fetch images at or beyond the viewport first (use scroll direction)
    //4 screenfuls ahead, 1 before
  };
  //trigger this when scrolling past the 2/3rds of the list, fetch as many items
  //as cached.
  app.fetch_more= function() {
    // TODO: post request for keys starting at end
    // insert them

  };

  app.refresh = function() {
    // TODO: Post request to index
    // insert elements until
    //   a) one of them matches the cache OR
    //   b) you reach the end of the list
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
      app.getForecast(key);
    });
  };

  var fakeForecast = {
    key: 'newyork',
    label: 'New York, NY',
    currently: {
      time: 1453489481,
      summary: 'Clear',
      icon: 'partly-cloudy-day',
      temperature: 60,
      apparentTemperature: 65,
      precipProbability: 0.25,
      humidity: 0.75,
      windBearing: 125,
      windSpeed: 1.50
    },
    daily: {
      data: [
        {icon: 'clear-day', temperatureMax: 60, temperatureMin: 50},
        {icon: 'rain', temperatureMax: 60, temperatureMin: 50},
        {icon: 'snow', temperatureMax: 60, temperatureMin: 50},
        {icon: 'sleet', temperatureMax: 60, temperatureMin: 50},
        {icon: 'fog', temperatureMax: 60, temperatureMin: 50},
        {icon: 'wind', temperatureMax: 60, temperatureMin: 50},
        {icon: 'partly-cloudy-day', temperatureMax: 60, temperatureMin: 50}
      ]
    }
  };
  // Uncomment the line below to test the app with fake data
  // app.updateForecastCard(fakeForecast);

  // Add code to save the users list of subscribed cities here

  // Add code to check if the user has any subscribed cities, and render 
  // those or the default data here.

})();
