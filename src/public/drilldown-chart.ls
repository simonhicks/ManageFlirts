window.createChart = (flirts) ->
  window.chart = new DrillDownChart({
    selector: 'container'
    title: 'L2C Flirts'
  }, flirts)

class DrillDownChart
  (opts, @data) ->
    {@selector, @title, @y-label, @x-label} = opts
    @drilldown-name = null
    self = @
    @chart = new Highcharts.Chart {
      chart: {renderTo: @selector, type: \column}
      title: {text: @title}
      exporting: {enabled: false}
      x-axis:
        text: @x-label
      y-axis:
        text: @y-label

      plot-options:
        column:
          cursor: \pointer
          point:
            events:
              click: ->
                if self.drilldown-name isnt null
                  self.drilldown-name = null
                  self.redraw!
                else
                  self.drilldown-name = @category
                  self.redraw!
          data-labels:
            enabled: true
            style:
              fontWeight: \bold
            formatter: -> "#{@y}"

      tooltip:
        formatter: ->
          self.get-tooltip @x, @y
    }
    @redraw!

  colors: Highcharts.getOptions().colors

  get-tooltip: (x, y) ->  # TODO make this configurable
    ordinize = (n) -> "#{n} time#{if n is 1 then "" else "s"}"
    if @is-drilled-down!
      "#{@get-name!} has flirted with #{x} #{ordinize y}<br/>Click to return to the overview"
    else
      "#{x} has flirted #{ordinize y}<br/>Click to view #{x}'s breakdown"

  is-drilled-down: -> @drilldown-name?

  get-categories: ~>
    @values! .headings

  get-data: ~>
    @values! .values

  get-name: ~>
    @values! .name

  get-flirts: ~>
    if @drilldown-name? then @data[@drilldown-name] else @data

  get-colors: ->
    @colors

  drilldown-view: (data, drilldown-name) ->
    [headings, i] = [[], 0]
    values = for target, num of data
      headings.push target
      color = @colors[i]
      i++
      {y: num, name: target, color: color}
    {headings: headings, values: values, name: drilldown-name}

  wide-view: (data, title) ->
    [headings, i] = [[], 0]
    values = for name, fs of data
      headings.push name
      color = @colors[i]
      i++
      value = 0
      [ value += num for target, num of fs ]
      {y: value, name: name, color: color}
    {headings: headings, values: values, name: title}

  values: ->
    unless @drilldown-name?
      @wide-view @get-flirts!, @title
    else
      @drilldown-view @get-flirts!, @drilldown-name

  redraw: ->
    @chart.x-axis[0].set-categories @get-categories!, false
    @chart.series[0]?.remove(false)
    name = @get-name!
    @chart.addSeries({
      name: name
      data: @get-data!
      color: @get-colors!
    }, false)
    if @drilldown-name?
      @chart.title = text: "#{name}'s Flirts"
      @chart.subtitle = text: "Who #{name} has been flirting with"
    else
      @chart.title = text: "L2C Flirts"
      @chart.subtitle = null
    @chart.redraw!

