var profile = angular.module('profile', [])

  .controller('ProfileController', function($scope, $http, $window, $location, Workouts) {

    $scope.data = {
      workouts: 'placeholder workout',
      username: $window.localStorage.getItem('username').charAt(0).toUpperCase() + $window.localStorage.getItem('username').slice(1)
    }

    //use this snippet to test with local data file
    $http.get('../testdata/new.json')
    .success(function(data) {
      $scope.data.workouts = data;
    })


    // //get all of a given user's workouts to display - function in routes.js will change
    // Workouts.getAllWorkouts()
    //   .then(function(data) {
    //     console.log("workouts data", data);
    //     $scope.data.workouts = data;
    //   })

    // //get current user's username - function in routes.js will change
    // Workouts.getUser()
    //   .then(function(data) {
    //     console.log("data username", data.username);
    //     $scope.data.username = data.username;
    //   })
  })

  // //directive for d3 bar chart
  profile.directive('barsChart', function () {

    return {
      restrict: 'E',     
      scope: {data: '=chartData'}, //tied to chart-data in html
      link: function (scope, element, attrs) {

      //******************************************//
      //********** AXIS FORMATTING, SVG **********//
      //******************************************//


      var margin = {
        top: 50,
        bottom: 10,
        left: 60, 
        right: 60
      },
      width = 800 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

      // X scale
      var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .1);

      // Y scale
      var y = d3.scale.linear()
          .rangeRound([height, 0]);

      // Color bands
      var color = d3.scale.ordinal()
          .range(["#00e6e6", "#5fa9f3", "#1176db", "#ff66cc"]);

      // Use our X scale to set a bottom axis
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      // Same for our left axis
      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .tickFormat(d3.format(".2s"));

      // Add our chart to the document body, make responsive w viewbox
      var svg = d3.select("bars-chart").append("svg")
         .attr("preserveAspectRatio", "none")
          .attr("viewBox", "0 0 800 400")
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.right + ")");

      //*************************************************
      //********** DATA RETRIEVAL & FORMATTING **********
      //*************************************************

      //get data from controller, rerender when new data added
      scope.$watch('data.workouts', function(newData, oldData) {
        return scope.render(newData);
      }, true);

      //render function each time we receive data from controller
      //leaving sortBy here for now, think about how to switch between time/calories
      scope.render = function(data, sortBy) {

        svg.selectAll("*").remove();
       
          //make sure numbers in data file are numbers
          data.forEach(function (d) {
            d.duration = +d.duration; 
            d.calories = +d.calories;
            d.year = +d.year;
            d.week = +d.week;
``         });

          // combine category data for each week with nest/rollup
          // keys = values to be combined. hard coded because we don't expect broad categories
          // to change too much so they are hardcoded here. could alternatively run a function
          // similar to the color.domain function below to obtain values
          data = d3.nest()
            .key(function(d) { return d.week; })
            .rollup(function(values) {
              var counts = {}, keys = ['stretching', 'other', 'cardio', 'weightlifting']
              keys.forEach(function(key) {
                counts[key] = d3.sum(values, function(d) {
                  if (d.category === key) {
                    //can switch between duration and calories here in refactor. returning
                    //a value here determines what values are rendered in stacked bar chart
                    return d.duration;
                  }
                })
              })
              return counts;
            })
            .entries(data);

          //flatten data with sum values to make it easier to work with
          data = data.map(function(d) {
            return d.value = {
              "week": moment().day("Sunday").week(d.key).format("MM/DD/YY"),
              "cardio": +d.values.cardio,
              "weightlifting": +d.values.weightlifting,
              "stretching": +d.values.stretching,
              "other": +d.values.other
            }
          }).reduce(function (d1, d2) {return d1.concat(d2)}, []);

         // Use values to set our color bands, skip week property
         // use d3.keys to populate keys array above?
          color.domain(d3.keys(data[0]).filter(function (key) {
              return key !== "week" && key !=="year";
          }));

          //calculate y values for each stacked bar
          data.forEach(function (d) {
            var y0 = 0;
            d.types = color.domain().map(function (name) {
              return {
                name: name,
                y0: y0,
                y1: y0 += +d[name],
                value: d[name]
              };
            });
            d.total = d.types[d.types.length - 1].y1;
          });

          // x domain is set of weeks
          x.domain(data.map(function (d) {
            return d.week;
          }));

          // y domain is max value of totals + a litle extra room for legend
          // can adjust return value depending on values displayed
          y.domain([0, d3.max(data, function (d) {
            return d.total + 50;
          })]);

          // make vertical text labels for x axis
          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
          .selectAll("text")
            .style("font-size", "8px")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start");

          svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("font-size", "12px")
            .text("minutes of exercise per week");

          var week = svg.selectAll(".week")
            .data(data)
            .enter().append("g")
            .attr("class", "g")
            .attr("transform", function (d) {
              return "translate(" + x(d.week) + ",0)";
            });

          // tooltip displays workout type + value for portion of bar user hovers over
          // called when bars are rendered
          var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return d.name + ": " + d.value;
            })

          svg.call(tip);
  
          // get types from each data object and render in stacked bar, 
          // show tooltips on mouseover
          week.selectAll("rect")
            .data(function (d) {
            return d.types;
          })
            .enter().append("rect")
            .attr("width", x.rangeBand())
            .attr("y", function (d) {
            return y(d.y1);
          })
            .attr("height", function (d) {
            return y(d.y0) - y(d.y1);
          })
            .style("fill", function (d) {
            return color(d.name);
          })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

          //i multiplier affects spacing between legend items
          var legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
            return "translate(0," + i * 15 + ")";
          });

          //colored squares in the legend
          legend.append("rect")
            .attr("x", width - 10)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", color);

          //legend text
          legend.append("text")
            .attr("x", width - 20)
            .attr("y", 5)
            .attr("dy", ".35em") //location of text labels
            .style("font-size", "10")
            .style("text-anchor", "end")
            .text(function (d) {
            return d;
          });

        };//scope.render        
      } //link
    };//return
  });//directive


// ************************************************
// ********** workoutDaysChart directive **********
// ************************************************

  profile.directive('workoutDaysChart', function () {

    

    return {
      restrict: 'E',     
      scope: {data: '=chartData'}, //tied to chart-data in html

      link: function (scope, element, attrs) {

        //obtain data from scope
        scope.$watch('data', function(newData, oldData) {
          return scope.render(newData);
        }, true);

        //render function each time we receive data from controller
        //leaving sortBy here for now, think about how to switch between time/calories
        scope.render = function(data, sortBy) {

        data = data.sort(function (a, b) {
          return d3.descending(a.datetime, b.datetime);
        })

        //load data from workouts done in the last 7 days
        data = data.filter(function(d) {            
          return (moment(d.datetime).format('YYYY-MM-DD') > moment().subtract(7, 'd').format('YYYY-MM-DD'))
        })

        // obtain the number of days worked out in the last week
        data = data.length;

        // two pieces of data for chart: number of days worked out, and not
        var dataset = [
          data/7, (7-data)/7
        ];


// d3/svg setup
    var width = 200,
        height = 200,
        radius = Math.min(width, height) / 2;

    var color = d3.scale.ordinal()
      .range(["#1D7CF2", "#D3D3D3"])

    var pie = d3.layout.pie()
      .sort(null);

    var arc = d3.svg.arc()
      .innerRadius(radius - 15)
      .outerRadius(radius - 50);

    var svg = d3.select("workout-days-chart").append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        // render donut chart
        var path = svg.selectAll("path")
            .data(pie(dataset))
          .enter().append("path")
            .attr("fill", function(d, i) { return color(i); })
            .attr("d", arc);

        svg.append("text")
          .attr("dy", ".35em") //to center in circle
          .attr("text-anchor", "middle")
          .attr("class", "exerciseDays")
          .attr("fill", "#1176db")
          .text(data);

        }//render
      }//link
    };//return
  });//directive

 profile.directive('caloriesChart', function () {

  
  return {
    restrict: 'E',     
    scope: {data: '=chartData'}, //tied to chart-data in html

    link: function (scope, element, attrs) {

      scope.$watch('data', function(newData, oldData) {
        return scope.render(newData);
      }, true);

      //render function each time we receive data from controller
      //leaving sortBy here for now, think about how to switch between time/calories
      scope.render = function(data, sortBy) {
     
      //make sure numbers in data file are numbers
      data.forEach(function (d) {
        d.duration = +d.duration; 
        d.calories = +d.calories;
        d.year = +d.year;
        d.week = +d.week;
      });

      data = data.sort(function (a, b) {
        return d3.descending(a.datetime, b.datetime);
      })

      data = data.filter(function(d) {            
        return (moment(d.datetime).format('YYYY-MM-DD') > moment().subtract(1, 'month').format('YYYY-MM-DD'))
      })
      
      data = d3.nest()
        .key(function(d) { return d.category; })
        .rollup(function(v) { return d3.sum(v, function(d) {return d.calories}) })
        .entries(data);

      var dataset = [];

      data.forEach(function(d) {
        dataset.push({category: d.key, calories: d.values});
      })

      var width = 200,
      height = 200,
      radius = Math.min(width, height) / 2;

      var color = d3.scale.ordinal()
        .range(["#00e6e6", "#5fa9f3", "#1176db", "#ff66cc"]);

      var arc = d3.svg.arc()
        .innerRadius(radius - 15)
        .outerRadius(radius - 50);

      var pie = d3.layout.pie()
        .value(function(d) { return d.calories; })
        .sort(null);

      // Add our chart to the document body, make responsive

      var svg = d3.select("calories-chart").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var path = svg.selectAll("path")
        .data(pie(dataset))
        .enter().append("path")
        .attr("fill", function(d, i) { return color(i);})
        .attr("d", arc);

      path.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text("hello")//function(d) { return d.data.age; });

      svg.append("text")
        .attr("dy", ".35em") //to center in circle
        .attr("text-anchor", "middle")
        .attr("class", "monthCalories")
        .attr("fill", "#1176db")
        .text(d3.sum(dataset, function(d) {return d.calories}));

        };//render
      } //link
    }; //return
  }); //directive

