var deltaRatio = [];
var ratio = [];
var deltaNeg = [];
var deltaPos = [];
var deltaDeaths = [];
var deltaHosp = [];
var movingAverageRatio = [];
var myChart;
var type = 'linear';
var defaultMovingAverage = 7;

createChart();
// Plot US data when we start
getHistoricData("https://api.covidtracking.com/api/v1/us/daily.json", "US");


function updateState(selectedState) {
  state = selectedState.value;
  if (state == 'US') {
    deleteOldData();
    createChart();
    getHistoricData("https://api.covidtracking.com/api/v1/us/daily.json", state);
    setStateHeader("USA");

  } else {
    stateName = selectedState.options[selectedState.selectedIndex].text;
    deleteOldData();
    createChart();
    getHistoricData("https://api.covidtracking.com/api/v1/states/daily.json", state);
    setStateHeader(stateName);

  }
}

function deleteOldData() {
  deltaRatio = [];
  ratio = [];
  deltaNeg = [];
  deltaPos = [];
  deltaDeaths = [];
  deltaHosp = [];
  movingAverageRatio = []
  myChart.destroy()
}

function setStateHeader(state) {
  document.getElementById('stateHeader').innerHTML = state;
}

function writeNumbers(state) {
  document.getElementById('deltaRatio').innerHTML = 'Daily Positive Rate: ' + (deltaRatio[0].y * 100) + '%';
  document.getElementById('newCases').innerHTML = 'New Positives :' + (deltaPos[0].y);

}

function createChart() {
  var ctx = document.getElementById('Covid19').getContext('2d');
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
          label: 'Daily Hospitalization',
          data: deltaHosp,
          borderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "#8c9ec5",
          borderColor: "#6886c5",
          fill: true,
          tension: 0,
          showLine: true,
          type: 'line',
          yAxisID: "y-axis-1",
          order: 1
        },
        {
          label: 'Daily positive to daily test ratio',
          data: deltaRatio,
          borderWidth: 1,
          pointRadius: 1,
          pointHoverRadius: 5,
          backgroundColor: "rgba(200,0,0,0.1)",
          borderColor: "#800040",
          fill: false,
          tension: 0,
          showLine: true,
          yAxisID: "y-axis-0",
          order: 1,

        },
        {
          label: 'Cumulative positive test ratio',
          data: ratio,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "rgba(0,0,200,0.1)",
          borderColor: "blue",
          fill: true,
          tension: 0,
          showLine: true,
          yAxisID: "y-axis-0",
          hidden: true
        },
        {
          label: 'Daily Positives',
          data: deltaPos,
          borderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "#fe346e",
          borderColor: "#fe346e",
          fill: true,
          tension: 0,
          showLine: true,
          type: 'bar',
          yAxisID: "y-axis-1",
          stack: "cases",
          order: 6

        },
        {
          label: 'Daily Negative Tests',
          data: deltaNeg,
          borderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "#639a67",
          borderColor: "#639a67",
          fill: true,
          tension: 0,
          showLine: true,
          type: 'bar',
          yAxisID: "y-axis-1",
          stack: "cases",
          order: 6
        },
        {
          label: 'Daily Deaths',
          data: deltaDeaths,
          borderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "black",
          borderColor: "black",
          fill: true,
          tension: 0,
          showLine: true,
          type: 'bar',
          yAxisID: "y-axis-1",
          hidden: true
        },
      ]
    },
    options: {
      responsive: true,
      aspectRatio: 0.5,
      maintainAspectRatio: true,
      scales: {
        xAxes: [{
          type: 'time',
          offset: true,
          stacked: true,
        }],
        yAxes: [{
          id: 'y-axis-1',
          type: type,
          position: 'right',
          stacked: true,
          scaleLabel: {
            display: true,
            labelString: 'Number of Cases'
          },
          ticks: {
            stepSize: 50000
          },
        }, {
          id: 'y-axis-0',
          type: 'linear',
          position: 'left',
          ticks: {
            max: 1,
            min: 0
          },
          gridLines: {
            display: false
          },
          scaleLabel: {
            display: true,
            labelString: 'Positive  Ratio'
          }
        }]
      },
      plugins: {
        zoom: {
          pan: {
            enabled: false,
            mode: 'x',
            speed: 0.1
          },
          zoom: {
            enabled: false,
            mode: 'x',
            speed: 0.1
          }
        }
      },
      tooltips: {
        mode: 'index',
      },
    }

  });
}


async function getHistoricData(url, state) {

  const response = await fetch(url);
  const responseJson = await response.json();

  for (key in responseJson) {
    if ((state == 'US') || (responseJson[key].state == state)) {
      if (moment(responseJson[key].date, "YYYYMMDD") > moment("20200320")) { // ignore dates before March 20
        formattedDate = moment(responseJson[key].date, "YYYYMMDD").format("YYYY-MM-DDTHH:mm:ss");
        if (responseJson[key].positiveIncrease && responseJson[key].totalTestResultsIncrease) {
          deltaRatio.push({
            x: new Date(formattedDate),
            y: round(Math.abs(Number((responseJson[key].positiveIncrease) / (responseJson[key].totalTestResultsIncrease))), 2)
          });

          ratio.push({
            x: new Date(formattedDate),
            y: round(Math.abs(Number((responseJson[key].positive) / (responseJson[key].totalTestResults))), 2)
          });

          deltaNeg.push({
            x: new Date(formattedDate),
            y: Math.abs(Number(responseJson[key].totalTestResultsIncrease - responseJson[key].positiveIncrease))
          });
          deltaPos.push({
            x: new Date(formattedDate),
            y: Math.abs(Number(responseJson[key].positiveIncrease))
          });
          deltaDeaths.push({
            x: new Date(formattedDate),
            y: Math.abs(Number(responseJson[key].deathIncrease))
          });
          deltaHosp.push({
            x: new Date(formattedDate),
            y: Math.abs(Number(responseJson[key].hospitalizedIncrease))
          });
        }
      }
    }
  }
  myChart.options.scales.yAxes[1].ticks.max = Math.min(round(Math.max.apply(null, deltaRatio.map(item => item.y)), 2) + 0.05, 1)
  addMovingAverage(myChart, defaultMovingAverage);
  myChart.update();
}

document.getElementById('toggleScale').addEventListener('click', function() {
  this.innerHTML = "change scale to " + type;
  type = type === 'linear' ? 'logarithmic' : 'linear';
  var yAxes = myChart.options.scales.yAxes;
  yAxes[0].type = type;
  myChart.update();
});

document.getElementById('addMovingAverage').addEventListener('click', function() {
  avgWindowInput = parseInt(document.getElementById('avgWindowInput').value)
  addMovingAverage(myChart, avgWindowInput);
});


function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function addMovingAverage(chart, avgWindow) {
  period = avgWindow;
  movingAverageRatio = []
  const getAverage = (data) => data.reduce((acc, val) => acc + val.y, 0) / data.length;
  for (var i = 0; len = deltaRatio.length, i + period - 1 < len; i++) {
    movingAverageRatio.push({
      x: new Date(deltaRatio[i].x),
      y: round(getAverage(deltaRatio.slice(i, i + period)), 2)
    });
  }


  chart.data.datasets.push({
    label: 'Moving Average Positive Ratio (' + period + ' day)',
    data: movingAverageRatio,
    borderWidth: 3,
    pointRadius: 0,
    pointHoverRadius: 5,
    backgroundColor: "rgba(0,0,0,0)",
    borderColor: "#000000",
    fill: true,
    tension: 0.4,
    showLine: true,
    yAxisID: "y-axis-0",
  });
  myChart.update();
}
