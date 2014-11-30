// Description
//   A Hubot script that returns adventar entry list
//
// Configuration:
//   None
//
// Commands:
//   hubot adventar <name> - returns adventar entry list
//
// Author:
//   bouzuya <m@bouzuya.net>
//
module.exports = function(robot) {
  var cheerio, request;
  request = require('request-b');
  cheerio = require('cheerio');
  return robot.respond(/adventar(?: (\S+))?$/i, function(res) {
    var baseUrl, query, url, _ref;
    query = (_ref = res.match[1]) != null ? _ref : 'Hubot';
    baseUrl = 'http://www.adventar.org';
    url = baseUrl + '/';
    return request(url).then(function(r) {
      var $, calendars;
      $ = cheerio.load(r.body);
      calendars = [];
      $('.mod-calendarList-title').filter(function() {
        return $(this).text().match(new RegExp(query, 'i'));
      }).each(function() {
        var e, title;
        e = $(this);
        title = e.text().trim();
        url = baseUrl + e.find('a').attr('href');
        return calendars.push({
          title: title,
          url: url
        });
      });
      if (calendars.length === 0) {
        return res.send('no calendar : ' + query);
      }
      res.send(calendars[0].url);
      return request(calendars[0].url).then(function(r) {
        var entries, message;
        $ = cheerio.load(r.body);
        entries = [];
        $('.mod-entryList tr').each(function() {
          var body, date, e, user;
          e = $(this);
          date = e.attr('data-date').trim();
          user = e.find('.mod-entryList-user').text().trim();
          body = e.find('.mod-entryList-body').text().trim();
          return entries.push({
            date: date,
            user: user,
            body: body
          });
        });
        message = entries.map(function(i) {
          return "" + i.date + " : " + i.user + " " + i.body;
        }).join('\n');
        return res.send(message);
      });
    });
  });
};
