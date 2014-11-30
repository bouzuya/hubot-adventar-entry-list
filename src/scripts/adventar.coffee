# Description
#   A Hubot script that returns adventar entry list
#
# Configuration:
#   None
#
# Commands:
#   hubot adventar <name> - returns adventar entry list
#
# Author:
#   bouzuya <m@bouzuya.net>
#
module.exports = (robot) ->
  request = require 'request-b'
  cheerio = require 'cheerio'

  robot.respond /adventar(?: (\S+))?$/i, (res) ->
    query = res.match[1] ? 'Hubot'
    baseUrl = 'http://www.adventar.org'
    url = baseUrl + '/'
    request(url).then (r) ->
      $ = cheerio.load r.body
      calendars = []
      $('.mod-calendarList-title').filter ->
        $(@).text().match(new RegExp(query, 'i'))
      .each ->
        e = $ @
        title = e.text().trim()
        url = baseUrl + e.find('a').attr('href')
        calendars.push { title, url }
      return res.send('no calendar : ' + query) if calendars.length is 0
      res.send calendars[0].url
      request(calendars[0].url).then (r) ->
        $ = cheerio.load r.body
        entries = []
        $('.mod-entryList tr').each ->
          e = $ @
          date = e.attr('data-date').trim()
          user = e.find('.mod-entryList-user').text().trim()
          body = e.find('.mod-entryList-body').text().trim()
          entries.push { date, user, body }
        message = entries.map (i) ->
          "#{i.date} : #{i.user} #{i.body}"
        .join '\n'
        res.send message
