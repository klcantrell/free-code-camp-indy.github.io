// Module pattern for script isolation.
(function () {
  var targetContentDivId = 'meetup-panels';
  var numberOfPanelsToDisplay = 3;
  var statusToHumanReadableDict = {
    'past': 'You just missed!',
    'upcoming': 'Happening Soon'
  }
  function getHumanReadableStatus(eventStatus) {
    return statusToHumanReadableDict[eventStatus];
  }
  function formatTime(timestamp) {
    var now = moment();
    var eventTime = moment(timestamp);
    var weekPriorToEvent = eventTime.subtract({weeks: 1});
    if (now.isBetween(eventTime, weekPriorToEvent)) {
      return eventTime.calendar();
    } else {
      return eventTime.format('LLL');
    }
  }
  function generatePanelHTML(variablesObject) {
    var templateData = {
      timeStatus: variablesObject.timeStatus,
      title: variablesObject.eventTitle,
      description: variablesObject.eventDescription,
      joinUrl: variablesObject.eventUrl,
      isUpcoming: variablesObject.eventStatus == 'upcoming',
      time: formatTime(variablesObject.eventTime),
      rsvp: variablesObject.eventRsvp
    };
    return _.template(
      '<div class="meetupPanel">' +
        '<h4><%- title %></h4>' +
        '<a class="panel-img-container" href="">' +
          // update this to grab the location
          '<img src="images/placeHolder.jpg" class="panel-img img-responsive" alt="<%- timeStatus %>">' +
        '</a>' +
        '<div class="meetupPanel__text">' +
          '<div class="meetupPanel__description">' +
            '<%= description %>' +
            (templateData.isUpcoming ?
              '<br/>' +
              '<p>RSVP Count: <%- rsvp %></p>' +
              '<p>Time: <%- time %></p>'
            : '') +
          '</div>' +
          '<span class="meetupPanel__ellipsis">...</span>' +
        '</div>' +
        '<div class="meetupPanel__controls">' +
          '<div class="fccBtn-small panel-toggler">' +
            '<svg width="30" height="24" viewBox="5 5 12 12">' +
              '<path fill="grey" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>' +
              '<path d="M0 0h24v24H0z" fill="none"/>' +
            '</svg>' +
          '</div>' +
          '<a class="joinBtn" href="<%- joinUrl %>">' + 
            '<div class="fccBtn-small">' +
            (templateData.isUpcoming ? 
              'Join us!' :
              'Missed it!') + 
            '</div>' + 
          '</a>' +
        '</div>' +
      '</div>'
    )(templateData);
  }
  function handleMeetupPanelToggle() {
    const $toggler = $('.panel-toggler');
    
    const expandMore = `
      <svg width="30" height="24" viewBox="5 5 12 12">
        <path fill="grey" d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
        <path d="M0 0h24v24H0z" fill="none"/>
      </svg>
    `;
    
    const expandLess = `
      <svg width="30" height="24" viewBox="5 5 12 12">
          <path fill="grey" d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
          <path d="M0 0h24v24H0z" fill="none"/>
      </svg>
    `;
    
    $toggler.on('click', function(e) {
      const panel = $(this).closest('.meetupPanel');
      let toggled = panel.data('toggled') === undefined ? true : !panel.data('toggled');
      panel.data('toggled', toggled);
      panel.toggleClass('meetupPanel--grow');
      panel.find('.meetupPanel__description').toggleClass('meetupPanel__description--show');
      panel.find('.meetupPanel__ellipsis').toggleClass('meetupPanel__ellipsis--hide');
      $(this).html(toggled ? expandLess : expandMore); 
    });
  }
  // Run only when document is ready.
  $(function () {
    var meetupEventDataRequest = $.getJSON('js/free-code-camp-events.mock.json');
    meetupEventDataRequest.then(function (data) {
      var sortedResults = _.sortBy(_.get(data, 'results'), 'time').reverse();
      var topResults = _.take(sortedResults, numberOfPanelsToDisplay);
      var panels = _.map(topResults, function (event) {
        var eventTitle = _.get(event, 'name');
        var eventStatus = _.get(event, 'status');
        var flavoredEventStatus = getHumanReadableStatus(eventStatus);
        var eventDescription = _.get(event, 'description');
        var eventUrl = _.get(event, 'event_url');
        var eventTime = _.get(event, 'time');
        var eventRsvp = _.get(event, 'yes_rsvp_count');
        return generatePanelHTML({
          timeStatus: flavoredEventStatus,
          eventStatus: eventStatus,
          eventTitle: eventTitle,
          eventDescription: eventDescription,
          eventUrl: eventUrl,
          eventTime: eventTime,
          eventRsvp: eventRsvp
        });
      });
      var innerHtml = panels.join('');
      document.getElementById(targetContentDivId).innerHTML = innerHtml;
      handleMeetupPanelToggle();
    });
  });
})();
