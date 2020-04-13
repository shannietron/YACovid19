var deltaRatio = [];
var ratio = [];
var totalNeg = [];
var totalPos = [];
var deltaDeaths = [];
var unconfirmed = [];
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
  deltaDeaths = [];
  unconfirmed = [];
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
          label: 'Total Positives',
          data: totalPos,
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
          stack: "cases"
        },
        {
          label: 'Total Negative Tests',
          data: totalNeg,
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
  for (key in states_tested_data) {
    if (states_tested_data[key].state == state) {
      if (states_tested_data[key].positive) {
        formattedDate = moment(states_tested_data[key].updatedon, 'DD/MM/YYYY').format("YYYY-MM-DDTHH:mm:ss");
        cumulativeRatio = round(Math.abs(Number(states_tested_data[key].positive / states_tested_data[key].totaltested)), 2);
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
          y: Number(states_tested_data[key].positive)
        })
        totalNeg.push({
          x: new Date(formattedDate),
          y: Number(states_tested_data[key].negative)
        })
      }

      myChart.update();
    }
  }
}


function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function diff(ary) {
  var newA = [];
  for (var i = 1; i < ary.length; i++) newA.push(ary[i] - ary[i - 1])
  return newA;
}
