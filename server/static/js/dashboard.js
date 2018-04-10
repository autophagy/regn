var graph_request = new XMLHttpRequest();
graph_request.open('GET', '/api/temperature/day', true);
var latest_request = new XMLHttpRequest();
latest_request.open('GET', '/api/latest', true);

var scatter

graph_request.onload = function() {
    if (graph_request.status >= 200 && graph_request.status < 400) {
        var dat = JSON.parse(graph_request.responseText);
        var scatterChartData = {
            datasets: [{
                data: dat.map(x => ({
                    "x": new Date(x["timestamp"]),
                    "y": x["value"]
                })),
                borderColor: '#e6e6e6',
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 0,
                lineTension: 0.5,
                fill: false,
                showLine: true
            }]
        };

        var chartOptions = {
            data: scatterChartData,
            options: {
                animation: false,
                legend: {
                    display: false
                },
                title: {
                    display: false,
                },
                scales: {
                    xAxes: [{
                        position: 'bottom',
                        type: 'time',
                        time: {
                            displayFormats: {
                                'millisecond': 'SSS [ms]',
                                'second': 'HH.MM.ss',
                                'minute': 'HH.MM'
                            },
                            stepSize: 10
                        },
                        distribution: 'series',
                        gridLines: {
                            color: '#e6e6e6',
                            drawOnChartArea: false,
                            drawTicks: false,
                            lineWidth: 3
                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'x axis'
                        },
                        ticks: {
                            fontColor: '#e6e6e6',
                            fontFamily: 'Inconsolata',
                            padding: 20
                        }
                    }],
                    yAxes: [{
                        position: 'left',
                        gridLines: {
                            color: '#e6e6e6',
                            drawOnChartArea: false,
                            drawTicks: false,
                            lineWidth: 3
                        },
                        scaleLabel: {
                            display: false,
                            labelString: 'y axis'
                        },
                        ticks: {
                            suggestedMin: -5,
                            suggestedMax: 25,
                            fontColor: '#e6e6e6',
                            fontFamily: 'Inconsolata',
                            padding: 20
                        }
                    }]
                }
            }
        }

        var ctx = document.getElementById("canvas").getContext("2d");
        window.myScatter = Chart.Scatter(ctx, chartOptions);

    }
};

latest_request.onload = function() {
    if (latest_request.status >= 200 && latest_request.status < 400) {
        var dat = JSON.parse(latest_request.responseText);
        document.getElementById("latest-temperature").innerHTML = dat['temperature'] + "°C"
        document.getElementById("latest-humidity").innerHTML = dat['humidity'] + "%"
        document.getElementById("latest-pressure").innerHTML = dat['pressure'] + " hPa"
        document.getElementById("latest-luminosity").innerHTML = dat['luminosity'] + " lux"
    }
};

graph_request.send();
latest_request.send();
