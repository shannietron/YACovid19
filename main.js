var deltaRatio = [];
var ratio = [];
var deltaTests = [];
var deltaPos = [];
var deltaDeaths = [];
var myChart;
createChart();
getHistoricData("https://covidtracking.com/api/v1/states/daily.json", "NY");


function updateState(selectedState) {
  state = selectedState.value;
  stateName = selectedState.options[selectedState.selectedIndex].text;
  deleteOldData();
  createChart();
  getHistoricData("https://covidtracking.com/api/v1/states/daily.json", state);
  setStateHeader(state);

}

function deleteOldData() {
  deltaRatio = [];
  ratio = [];
  deltaTests = [];
  deltaPos = [];
  deltaDeaths = [];
  myChart.destroy()
}

function setStateHeader(state) {
  document.getElementById('stateHeader').innerHTML = stateName;
}

function createChart() {
  var ctx = document.getElementById('Covid19').getContext('2d');
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
          label: 'Daily positive to daily test ratio',
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
          label: 'Daily Tests',
          data: deltaTests,
          borderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          backgroundColor: "#527318",
          borderColor: "#527318",
          fill: true,
          tension: 0,
          showLine: true,
          type: 'bar',
          yAxisID: "y-axis-1",
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
        },
      ]
    },
    options: {
      responsive: false,
      aspectRatio: 0.5,
      maintainAspectRatio: true,
      scales: {
        xAxes: [{
          type: 'time',
          offset: true
        }],
        yAxes: [{
          id: 'y-axis-1',
          type: 'linear',
          position: 'left',
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
      plugins: {
        zoom: {
          pan: {
            enabled: false,
            mode: 'x',
            speed:0.1
          },
          zoom: {
            enabled: false,
            mode: 'x',
            speed:0.1
          }
        }
      },
    }

  });
}


async function getHistoricData(url, state) {

  const response = await fetch(url);
  const responseJson = await response.json();

  for (key in responseJson) {
    if (responseJson[key].state == state) {
      formattedDate = moment(responseJson[key].date, "YYYYMMDD").format("YYYY-MM-DDTHH:mm:ss");
      if (responseJson[key].positiveIncrease && responseJson[key].totalTestResultsIncrease) {
        deltaRatio.push({
          x: new Date(formattedDate),
          y: Math.abs(Number((responseJson[key].positiveIncrease) / (responseJson[key].totalTestResultsIncrease)))
        });

        ratio.push({
          x: new Date(formattedDate),
          y: Math.abs(Number((responseJson[key].positive) / (responseJson[key].totalTestResults)))
        });

        deltaTests.push({
          x: new Date(formattedDate),
          y: Math.abs(Number(responseJson[key].totalTestResultsIncrease))
        });
        deltaPos.push({
          x: new Date(formattedDate),
          y: Math.abs(Number(responseJson[key].positiveIncrease))
        });
        deltaDeaths.push({
          x: new Date(formattedDate),
          y: Math.abs(Number(responseJson[key].deathIncrease))
        });
      }
    }
  }
  myChart.update();
}
