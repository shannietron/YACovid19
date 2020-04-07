data = getHistoricData("https://covidtracking.com/api/v1/states/daily.json");
deltaRatio=[];
ratio=[];
deltaTests=[];
deltaPos=[];

var ctx = document.getElementById('Covid19').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'Daily positive to daily test ratio',
            data: deltaRatio,
            borderWidth: 0,
            pointRadius: 3,
            pointHoverRadius: 5,
            backgroundColor:"rgba(255,0,0,0.1)",
            borderColor:"#fc0107",
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
            backgroundColor:"rgba(0,0,255,0.1)",
            borderColor:"blue",
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
            backgroundColor:"#527318",
            borderColor:"#527318",
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
            backgroundColor:"#fe346e",
            borderColor:"#fe346e",
            fill: true,
            tension: 0,
            showLine: true,
            type: 'bar',
            yAxisID: "y-axis-1",
        },
      ]
    },
    options: {
      responsive: true,
      aspectRatio:0.5,
      maintainAspectRatio: false,
        scales: {
          xAxes: [{
                type: 'time',
            }],
            yAxes:  [{
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
        }
    }

});


async function getHistoricData(url) {
  const response = await fetch(url);
  const responseJson = await response.json();

  for (key in responseJson) {
    if(responseJson[key].state=="NY"){
      formattedDate = moment(responseJson[key].date,"YYYYMMDD").format("YYYY-MM-DDTHH:mm:ss");
      deltaRatio.push({
        x: new Date(formattedDate),
        y: Number((responseJson[key].positiveIncrease)/(responseJson[key].totalTestResultsIncrease)),
      });

      ratio.push({
        x: new Date(formattedDate),
        y: Number((responseJson[key].positive)/(responseJson[key].totalTestResults))
      });

      deltaTests.push({
        x: new Date(formattedDate),
        y: Number(responseJson[key].totalTestResultsIncrease)
      });
      deltaPos.push({
        x: new Date(formattedDate),
        y: Number(responseJson[key].positiveIncrease)
      });
    }
  }
  myChart.update();


}
