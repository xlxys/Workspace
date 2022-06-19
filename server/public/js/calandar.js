document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    themeSystem: 'bootstrap5',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    initialDate: '2022-06-21',
    navLinks: true, // can click day/week names to navigate views
    dayMaxEvents: true, // allow "more" link when too many events
    events: {
      url: '/resource',
      failure: function () {
        document.getElementById('script-warning').style.display = 'block'
      }
    },
    loading: function (bool) {
      document.getElementById('loading').style.display =
        bool ? 'block' : 'none';
    }
  });

  calendar.render();
});

