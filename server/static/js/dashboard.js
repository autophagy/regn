class Dashboard {
    constructor() {
        this.defaultSensorType = 'temperature'
        this.defaultGranularity = 'day'

        this.sensorTypes = Object.freeze({
            'temperature': {
                'apiTerm': 'temperature',
                'title': 'Temperature',
                'unit': '°C',
                'suggestedMin': -5,
                'suggestedMax': 25,
            },
            'humidity': {
                'apiTerm': 'humidity',
                'title': 'Humidity',
                'unit': '%',
                'suggestedMin': 0,
                'suggestedMax': 100,
            },
            'pressure': {
                'apiTerm': 'pressure',
                'title': 'Pressure',
                'unit': ' hPa',
                'suggestedMin': 900,
                'suggestedMax': 1100,
            },
            'luminosity': {
                'apiTerm': 'luminosity',
                'title': 'Luminosity',
                'unit': ' lux',
                'suggestedMin': 0,
                'suggestedMax': 1500,
            },
        });

        this.granularities = Object.freeze({
            'day': {
                'apiTerm': 'day',
                'title': 'Day',
            },
            'week': {
                'apiTerm': 'week',
                'title': 'Week',
            },
            'month': {
                'apiTerm': 'month',
                'title': 'Month',
            },
            'year': {
                'apiTerm': 'year',
                'title': 'Year',
            },
        });

        this.lastUpdated = new Date().getTime();
        this.mode = this.sensorTypes[this.defaultSensorType];
        this.granularity = this.granularities[this.defaultGranularity];
        this.refresh_latest();
        this.init_dashboard();
    }

    init_dashboard() {
        var graph_request = new XMLHttpRequest();
        graph_request.open('GET', '/api/' + this.mode.apiTerm + '/' + this.granularity.apiTerm, true);
        var self = this
        graph_request.onload = function() {
            if (graph_request.status >= 200 && graph_request.status < 400) {
                self.create_new_graph(JSON.parse(graph_request.responseText))
            }
        }
        graph_request.send();
    }

    refresh_latest() {
        var latest_request = new XMLHttpRequest();
        latest_request.open('GET', '/api/latest', true);
        var self = this
        latest_request.onload = function() {
            if (latest_request.status >= 200 && latest_request.status < 400) {
                var dat = JSON.parse(latest_request.responseText);
                for (var key in self.sensorTypes) {
                    document.getElementById("latest-" + self.sensorTypes[key].apiTerm).innerHTML = dat[self.sensorTypes[key].apiTerm] + self.sensorTypes[key].unit
                    document.getElementById("latest-" + self.sensorTypes[key].apiTerm + "-title").innerHTML = self.sensorTypes[key].title
                }
            }
        };
        latest_request.send();
    }

    create_new_graph(data) {
        var scatterChartData = {
            datasets: [{
                data: data.map(x => ({
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
                            suggestedMin: this.mode.suggestedMin,
                            suggestedMax: this.mode.suggestedMax,
                            fontColor: '#e6e6e6',
                            fontFamily: 'Inconsolata',
                            padding: 20
                        }
                    }]
                }
            }
        };

        if (this.graph == null) {
            var ctx = document.getElementById("canvas").getContext("2d");
            this.graph = Chart.Scatter(ctx, chartOptions);
        } else {
            this.graph.options = chartOptions;
            this.graph.update();
        }
    }
}

var dashboard = new Dashboard();
