var DrillDownChart;
window.createChart = function(flirts){
  return window.chart = new DrillDownChart({
    selector: 'container',
    title: 'L2C Flirts'
  }, flirts);
};
DrillDownChart = (function(){
  DrillDownChart.displayName = 'DrillDownChart';
  var prototype = DrillDownChart.prototype, constructor = DrillDownChart;
  function DrillDownChart(opts, data){
    var self;
    this.data = data;
    this.getFlirts = bind$(this, 'getFlirts', prototype);
    this.getName = bind$(this, 'getName', prototype);
    this.getData = bind$(this, 'getData', prototype);
    this.getCategories = bind$(this, 'getCategories', prototype);
    this.selector = opts.selector, this.title = opts.title, this.yLabel = opts.yLabel, this.xLabel = opts.xLabel;
    this.drilldownName = null;
    self = this;
    this.chart = new Highcharts.Chart({
      chart: {
        renderTo: this.selector,
        type: 'column'
      },
      title: {
        text: this.title
      },
      exporting: {
        enabled: false
      },
      xAxis: {
        text: this.xLabel
      },
      yAxis: {
        text: this.yLabel
      },
      plotOptions: {
        column: {
          cursor: 'pointer',
          point: {
            events: {
              click: function(){
                if (self.drilldownName !== null) {
                  self.drilldownName = null;
                  return self.redraw();
                } else {
                  self.drilldownName = this.category;
                  return self.redraw();
                }
              }
            }
          },
          dataLabels: {
            enabled: true,
            style: {
              fontWeight: 'bold'
            },
            formatter: function(){
              return this.y + "";
            }
          }
        }
      },
      tooltip: {
        formatter: function(){
          return self.getTooltip(this.x, this.y);
        }
      }
    });
    this.redraw();
  }
  prototype.colors = Highcharts.getOptions().colors;
  prototype.getTooltip = function(x, y){
    var ordinize;
    ordinize = function(n){
      return n + " time" + (n === 1 ? "" : "s");
    };
    if (this.isDrilledDown()) {
      return this.getName() + " has flirted with " + x + " " + ordinize(y) + "<br/>Click to return to the overview";
    } else {
      return x + " has flirted " + ordinize(y) + "<br/>Click to view " + x + "'s breakdown";
    }
  };
  prototype.isDrilledDown = function(){
    return this.drilldownName != null;
  };
  prototype.getCategories = function(){
    return this.values().headings;
  };
  prototype.getData = function(){
    return this.values().values;
  };
  prototype.getName = function(){
    return this.values().name;
  };
  prototype.getFlirts = function(){
    if (this.drilldownName != null) {
      return this.data[this.drilldownName];
    } else {
      return this.data;
    }
  };
  prototype.getColors = function(){
    return this.colors;
  };
  prototype.drilldownView = function(data, drilldownName){
    var ref$, headings, i, res$, target, num, color, values;
    ref$ = [[], 0], headings = ref$[0], i = ref$[1];
    res$ = [];
    for (target in data) {
      num = data[target];
      headings.push(target);
      color = this.colors[i];
      i++;
      res$.push({
        y: num,
        name: target,
        color: color
      });
    }
    values = res$;
    return {
      headings: headings,
      values: values,
      name: drilldownName
    };
  };
  prototype.wideView = function(data, title){
    var ref$, headings, i, res$, name, fs, color, value, target, num, values;
    ref$ = [[], 0], headings = ref$[0], i = ref$[1];
    res$ = [];
    for (name in data) {
      fs = data[name];
      headings.push(name);
      color = this.colors[i];
      i++;
      value = 0;
      for (target in fs) {
        num = fs[target];
        value += num;
      }
      res$.push({
        y: value,
        name: name,
        color: color
      });
    }
    values = res$;
    return {
      headings: headings,
      values: values,
      name: title
    };
  };
  prototype.values = function(){
    if (this.drilldownName == null) {
      return this.wideView(this.getFlirts(), this.title);
    } else {
      return this.drilldownView(this.getFlirts(), this.drilldownName);
    }
  };
  prototype.redraw = function(){
    var ref$, name;
    this.chart.xAxis[0].setCategories(this.getCategories(), false);
    if ((ref$ = this.chart.series[0]) != null) {
      ref$.remove(false);
    }
    name = this.getName();
    this.chart.addSeries({
      name: name,
      data: this.getData(),
      color: this.getColors()
    }, false);
    if (this.drilldownName != null) {
      this.chart.title = {
        text: name + "'s Flirts"
      };
      this.chart.subtitle = {
        text: "Who " + name + " has been flirting with"
      };
    } else {
      this.chart.title = {
        text: "L2C Flirts"
      };
      this.chart.subtitle = null;
    }
    return this.chart.redraw();
  };
  return DrillDownChart;
}());
function bind$(obj, key, target){
  return function(){ return (target || obj)[key].apply(obj, arguments) };
}