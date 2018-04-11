class Dashboard {
    constructor() {
        this.defaultSensorType = 'temperature'
        this.defaultGranularity = 'day'

        this.latestReadingTypes = Object.freeze({
            'latitude': {
                'apiTerm': 'latitude',
                'title': 'Latitude',
                'unit': '°',
            },
            'longitude': {
                'apiTerm': 'longitude',
                'title': 'Longitude',
                'unit': '°',
            },
            'temperature': {
                'apiTerm': 'temperature',
                'title': 'Temperature',
                'unit': '°C',
            },
            'humidity': {
                'apiTerm': 'humidity',
                'title': 'Humidity',
                'unit': '%',
            },
            'pressure': {
                'apiTerm': 'pressure',
                'title': 'Pressure',
                'unit': ' hPa',
            },
            'luminosity': {
                'apiTerm': 'luminosity',
                'title': 'Luminosity',
                'unit': ' lux',
            },
        });

        this.sensorTypes = Object.freeze({
            'temperature': {
                'apiTerm': 'temperature',
                'suggestedMin': -5,
                'suggestedMax': 25,
            },
            'humidity': {
                'apiTerm': 'humidity',
                'suggestedMin': 0,
                'suggestedMax': 100,
            },
            'pressure': {
                'apiTerm': 'pressure',
                'suggestedMin': 900,
                'suggestedMax': 1100,
            },
            'luminosity': {
                'apiTerm': 'luminosity',
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

        this.mode = this.sensorTypes[this.defaultSensorType];
        this.granularity = this.granularities[this.defaultGranularity];
        this.refresh_latest();
        this.create_dashboard();
    }

    create_dashboard() {
        this.lastUpdated = new Date().getTime();
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
                for (var key in self.latestReadingTypes) {
                    var readingType = self.latestReadingTypes[key]
                    document.getElementById("latest-" + readingType.apiTerm).innerHTML = dat[readingType.apiTerm] + readingType.unit
                    document.getElementById("latest-" + readingType.apiTerm + "-title").innerHTML = readingType.title
                }
            }
        };
        latest_request.send();
    }

    refresh_graph() {
        var latest_graph = new XMLHttpRequest();
        latest_graph.open('GET', ['/api', this.mode.apiTerm, this.granularity.apiTerm, this.lastUpdated].join('/'), true)
        var self = this
        latest_graph.onload = function() {
            if (latest_graph.status >= 200 && latest_graph.status < 400) {
                self.lastUpdated = new Date().getTime();
                var dat = JSON.parse(latest_graph.responseText);
                if (dat.length > 0) {
                    var data = self.graph.config.data.datasets[0].data
                    for (var i = 0; i < dat.length; i++) {
                        data.push({"x": new Date(dat[i]["timestamp"]), "y": dat[i]["value"]});
                    }
                    var scatterChartData = {
                        datasets: [{
                            data: data,
                            borderColor: '#e6e6e6',
                            borderWidth: 3,
                            pointRadius: 0,
                            pointHoverRadius: 0,
                            lineTension: 0.5,
                            fill: false,
                            showLine: true
                        }],
                        labels: []
                    };
                    self.graph.config.data = scatterChartData;
                    self.graph.update();
                }
            }
        }
        latest_graph.send();
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
                responsive: true,
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
                            autoSkip: true,
                            maxTicksLimit: 5,
                            fontColor: '#e6e6e6',
                            fontFamily: 'Inconsolata',
                            padding: 20,
                            maxRotation: 0,
                            minRotation: 0
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

        var ctx = document.getElementById("canvas").getContext("2d");
        this.graph = Chart.Scatter(ctx, chartOptions);
    }

    switch_mode(mode) {
        this.mode = this.sensorTypes[mode];
        this.create_dashboard();
    }

    switch_granularity(granularity) {
        this.granularity = this.granularities[granularity];
        this.create_dashboard();
    }
}

var dashboard = new Dashboard();

setInterval(function(){
    dashboard.refresh_latest();
    dashboard.refresh_graph();
}, 10000);
