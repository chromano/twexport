var twexport = angular.module('twexport', ['ngRoute', 'ngHello']);


twexport.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/lists/:slug', {
            templateUrl: '/export/list.html',
            controller: 'PeopleExportCtrl',
            resolve: {
                exportConfig: function() {
                    return {
                        requestURL: 'lists/members.json',
                        requestParams: function(me, params) {
                            return {
                                owner_screen_name: me.screen_name,
                                slug: params.slug
                            }
                        },
                        downloadAs: function(params) {
                            return 'twexport-lists-' + params.slug;
                        }
                    }
                }
            }
        })
        .when('/friends', {
            templateUrl: '/export/friends.html',
            controller: 'PeopleExportCtrl',
            resolve: {
                exportConfig: function($routeParams) {
                    return {
                        requestURL: 'friends/list.json',
                        requestParams: function(me, params) {
                            return {
                                owner_screen_name: me.screen_name
                            }
                        },
                        downloadAs: function(params) {
                            return 'twexport-friends';
                        }
                    }
                }
            }
        })
        .when('/tweets', {
            templateUrl: '/export/tweets.html',
            controller: 'TweetsExportCtrl'
        });
});


twexport.controller('MainCtrl', function($scope, hello, $location) {
    $scope.me = hello('twitter').api('me');
    $scope.me.then(function(response) {
        hello('twitter').api('lists/list.json', {
            screen_name: response.screen_name
        }).then(function(response) {
            $scope.$apply(function() {
                $scope.lists = response.data;
            });
        });
    });
});


twexport.controller('PeopleExportCtrl', function($scope, hello, $timeout, $http, $routeParams, exportConfig) {
    $scope.fields = {
        'screen_name': true,
        'name': true,
        'url': true,
        'statuses_count': true,
        'friends_count': true,
        'time_zone': true,
        'description': true,
        'geo_enabled': true,
        'protected': true,
        'followers_count': true,
        'lang': true,
        'listed_count': true,
        'created_at': true,
    };
    $scope.summary = {'people': 0, 'followers': 0};
    $scope.results = [];

    $scope.download = function() {
        var csv = Papa.unparse({
            fields: Object.keys($scope.fields),
            data: $scope.results
        });
        var blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
        var filename = exportConfig.downloadAs($routeParams);
        var date = (new Date()).toISOString();
        filename += '-' + date + '.csv';
        saveAs(blob, filename);
    };

    function list_members(path, params, cursor) {
        hello('twitter').api(path + '?cursor=' + cursor, params).then(
            function(response) {
                $scope.$apply(function() {
                    angular.forEach(response.users, function(user) {
                        $scope.results.push(user);
                        $scope.summary.people += 1;
                        $scope.summary.followers += user.followers_count;
                    });
                });
                if (response.next_cursor) {
                    list_members(path, params, response.next_cursor);
                }
            });
    }

    $scope.$parent.me.then(function(me) {
        var params = exportConfig.requestParams(me, $routeParams);
        list_members(exportConfig.requestURL, params, -1);
    });
});


twexport.controller('TweetsExportCtrl', function($scope, hello, $timeout, $http) {
    $scope.fields = {
        'created_at': true,
        'id_str': true,
        'text': true,
        'retweet_count': true,
        'retweeted': true,
        'source': true
    };
    $scope.summary = {'tweets': 0};
    $scope.results = [];

    $scope.download = function() {
        var csv = Papa.unparse({
            fields: Object.keys($scope.fields),
            data: $scope.results
        });
        var blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
        var filename = 'twexport-tweets';
        var date = (new Date()).toISOString();
        filename += '-' + date + '.csv';
        saveAs(blob, filename);
    };

    $scope.$parent.me.then(function(me) {
        hello('twitter').api('statuses/user_timeline.json', {
            screen_name: me.screen_name,
            count: 200
        }).then(function(response) {
            $scope.$apply(function() {
                angular.forEach(response.data, function(tweet) {
                    $scope.results.push(tweet);
                    $scope.summary.tweets += 1;
                });
            });
        });
    });
});
