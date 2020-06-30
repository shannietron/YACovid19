var deltaRatio = [];
var ratio = [];
var totalNeg = [];
var totalPos = [];
var deltaPos = [];
var deltaDeaths = [];
var unconfirmed = [];
var deltaNeg = [];
var type = 'linear';
var movingAverageRatio = [];


var myChart;
state_test_data_url = "https://api.covid19india.org/state_test_data.json"
createChart();
getHistoricData(state_test_data_url, "Maharashtra");

function updateState(selectedState) {
  state = selectedState.value;
  stateName = selectedState.options[selectedState.selectedIndex].text;
  deleteOldData();
  createChart();
  getHistoricData(state_test_data_url, state);
  setStateHeader(state);
}

function deleteOldData() {
  deltaRatio = [];
  ratio = [];
  totalNeg = [];
  totalPos = [];
  deltaPos = [];
  deltaDeaths = [];
  unconfirmed = [];
  deltaNeg = [];
  movingAverageRatio = [];
  myChart.destroy()
}

function setStateHeader(state) {
  document.getElementById('stateHeader').innerHTML = stateName;
}

function createChart() {
  var ctx = document.getElementById('Covid19India').getContext('2d');
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
          label: 'Cumulative positive test ratio',
          data: ratio,
          borderWidth: 0,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "rgba(0,0,255,0.1)",
          borderColor: "blue",
          fill: true,
          tension: 0,
          showLine: true,
          yAxisID: "y-axis-0",
        },
        {
          label: 'Daily positive test ratio',
          data: deltaRatio,
          borderWidth: 0,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "rgba(255,0,0,0.1)",
          borderColor: "#fc0107",
          fill: true,
          tension: 0,
          showLine: true,
          yAxisID: "y-axis-0",
        },
        {
          label: 'delta Positives',
          data: deltaPos,
          borderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "#fe346e",
          borderColor: "#fe346e",
          type: 'bar',
          yAxisID: "y-axis-1",
          stack: "cases"
        },
        {
          label: 'Delta Negative Tests',
          data: deltaNeg,
          borderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "#639a67",
          borderColor: "#639a67",
          fill: true,
          type: 'bar',
          yAxisID: "y-axis-1",
          stack: "cases"
        },
        {
          label: 'unconfirmed',
          data: unconfirmed,
          borderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "grey",
          borderColor: "grey",
          fill: true,
          tension: 0,
          showLine: true,
          type: 'bar',
          yAxisID: "y-axis-1",
          stack: "cases"
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
          time: {
            unit: 'day',
          },
          offset: true,
          stacked: true
        }],
        yAxes: [{
          id: 'y-axis-1',
          type: 'linear',
          position: 'left',
          stacked: true
        }, {
          id: 'y-axis-0',
          type: 'linear',
          position: 'right',
          ticks: {
            max: 1,
            min: 0
          }
        }]
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
  states_tested_data = responseJson.states_tested_data
  var lastPos = 0;
  var lastNeg = 0;
  var currentPos = 0;
  var currentNeg = 0;
  var dailyRatio = 0;
  for (key in states_tested_data) {
    if (states_tested_data[key].state == state) {
      if (states_tested_data[key].positive) {
        formattedDate = moment(states_tested_data[key].updatedon, 'DD/MM/YYYY').format("YYYY-MM-DDTHH:mm:ss");
        cumulativeRatio = round(Math.abs(Number(states_tested_data[key].positive / states_tested_data[key].totaltested)), 2);
        currentPos = states_tested_data[key].positive;
        currentNeg = states_tested_data[key].negative;
        currentDeltaPos = Math.max(0, (currentPos - lastPos));
        currentDeltaNeg = Math.max(0, (currentNeg - lastNeg));
        dailyRatio = round((currentDeltaPos / (currentDeltaPos + currentDeltaNeg)), 2)

        ratio.push({
          x: new Date(formattedDate),
          y: cumulativeRatio
        });
        unconfirmed.push({
          x: new Date(formattedDate),
          y: Number(states_tested_data[key].unconfirmed)
        });
        totalPos.push({
          x: new Date(formattedDate),
          y: Number(currentPos)
        })
        totalNeg.push({
          x: new Date(formattedDate),
          y: Number(currentNeg)
        })
        deltaPos.push({
          x: new Date(formattedDate),
          y: Number(currentDeltaPos)
        })
        deltaNeg.push({
          x: new Date(formattedDate),
          y: Number(currentDeltaNeg)
        })
        deltaRatio.push({
          x: new Date(formattedDate),
          y: Number(dailyRatio)
        })
        lastPos = states_tested_data[key].positive;
        lastNeg = states_tested_data[key].negative;

      }
      myChart.update();
    }
  }

}

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
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
    label: 'Moving Average Positive Ratio ('+period + ' day)',
    data: movingAverageRatio,
    borderWidth: 5,
    pointRadius: 3,
    pointHoverRadius: 5,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderColor: "#000000",
    fill: true,
    tension: 0,
    showLine: true,
    yAxisID: "y-axis-0",
  });
  myChart.update();
}


function diff(ary) {
  var newA = [];
  for (var i = 1; i < ary.length; i++) {
    newA.push({
      x: (ary[i].x),
      y: (Math.max(0, (ary[i].y - ary[i - 1].y)))
    })
  }
  deltaPos = newA;
  return newA;
}
