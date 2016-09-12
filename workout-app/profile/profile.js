angular.module('profile', [])

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

  //directive for d3 bar chart
  .directive('barsChart', function ($parse) {
    var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 60
    },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    return {
      restrict: 'E',
      replace: false,
      scope: {data: '=chartData'},

      link: function (scope, element, attrs) {

        // Our X scale
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

        // Our Y scale
        var y = d3.scale.linear()
            .rangeRound([height, 0]);

        // Our color bands
        var color = d3.scale.ordinal()
            .range(["#00e6e6", "#5fa9f3", "#1176db", "#ff66cc"]);

        // Use our X scale to set a bottom axis
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        // Smae for our left axis
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(d3.format(".2s"));



        // Add our chart to the document body
        var svg = d3.select("bars-chart").classed("svg-container", true).append("svg")
           .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 600 400")
           //class to make it responsive
           .classed("svg-content-responsive", true)
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.json('../testdata/new.json', function (error, data) {
          //Force numbers into numbers format

          data.forEach(function (d) {
            d.duration = +d.duration;
            d.calories = +d.calories;
            d.year = +d.year;
            d.week = +d.week;
           });

          //combine category data for each week with nest/rollup
          data = d3.nest()
            .key(function(d) { return d.week; })
            .rollup(function(values) {
              var counts = {}, keys = ['stretching', 'other', 'cardio', 'weightlifting']
              keys.forEach(function(key) {
                counts[key] = d3.sum(values, function(d) {
                  if (d.category === key) {
                    //can switch between duration and calories here in refactor
                    return d.duration;
                  }
                })
              })
              return counts;
            })
            .entries(data);

          //reflatten array with sum values to make it easier to work with
          var flat = data.map(function(d) {
            return d.value = {
              "week": moment().day("Sunday").week(d.key).format("MM/DD/YYYY"),
              "cardio": +d.values.cardio,
              "weightlifting": +d.values.weightlifting,
              "stretching": +d.values.stretching,
              "other": +d.values.other
            }
          }).reduce(function (d1, d2) {return d1.concat(d2)}, []);

         // Use values to set our color bands, skip week property
         //use d3.keys to populate keys array above?
          color.domain(d3.keys(flat[0]).filter(function (key) {
              return key !== "week" && key !=="year";
          }));

          flat.forEach(function (d) {
            var y0 = 0;
            d.types = color.domain().map(function (name) {
              return {
                name: name,
                y0: y0,
                y1: y0 += +d[name]
              };
            });
            d.total = d.types[d.types.length - 1].y1;
          });

          // Sort by week

          flat.sort(function (a, b) {
            return a.week - b.week;
          });

          // Our X domain is our set of weeks
          x.domain(flat.map(function (d) {
            return d.week;
          }));

          // Our Y domain is from zero to our highest total
          y.domain([0, d3.max(flat, function (d) {
            return d.total + 100;
          })]);

          var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return d.cardio;
            })

          svg.call(tip);

          //make text labels vertical
          svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis)
            .selectAll("text")
              .attr("y", 0)
              .attr("x", 9)
              .attr("dy", ".35em")
              .attr("transform", "rotate(90)")
              .style("text-anchor", "start");

          svg.append("g")
              .attr("class", "y axis")
              .call(yAxis)
              .append("text")
              .text("minutes of exercise");



          var week = svg.selectAll(".week")
              .data(flat)
              .enter().append("g")
              .attr("class", "g")
              .attr("transform", function (d) {
              return "translate(" + x(d.week) + ",0)";
          });


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


          // .on("mouseover", function(){return tooltip.style("visibility", "visible");})
          // .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
          // .on("mouseout", function(){return tooltip.style("visibility", "hidden");});


          //i multiplier affects spacing between legend items
          var legend = svg.selectAll(".legend")
              .data(color.domain().slice().reverse())
              .enter().append("g")
              .attr("class", "legend")
              .attr("transform", function (d, i) {
              return "translate(0," + i * 20 + ")";
          });

          //these are the colored squares in the legend
          legend.append("rect")
              .attr("x", width - 18)
              .attr("width", 18)
              .attr("height", 18)
              .style("fill", color);

          //legend text
          legend.append("text")
              .attr("x", width - 24)
              .attr("y", 9)
              .attr("dy", ".35em")
              .style("text-anchor", "end")
              .text(function (d) {
              return d;
          });




        });
      }
    };
 });

