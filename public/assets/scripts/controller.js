/**
 * APP CONTROLLER
 */
Atlas.controller('appController', [
  "$scope",
  "AuthService",
  function($scope, AuthService){
    $scope.credentials = {};

    $scope.login = function(credentials){
      var authentication = {"authentication"  : credentials };

      AuthService.save(authentication, function(res){
        if (res.authentication && res.authentication.token) {
          var token = res.authentication.token;
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('logged-in', true);
        }else{
          sessionStorage.setItem('logged-in', false);
        }
      });
    };

    $scope.logout = function(){
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('logged-in');
    };

    $scope.isLoggedIn = function(){
      return !!sessionStorage.getItem('logged-in') && !!sessionStorage.getItem('token') || false;
    }

    $scope.range = function(num){
      return new Array(num);
    };

  }
]);

/**
 * DATA SOURCE INDEX CONTROLLER
 */
Atlas.controller('DataSourceIndexController', [
  'DataSourceService',
  '$scope',

  function(DataSourceService, $scope){
    $scope.serverList         = [];

    $scope.renderList = function(){
      DataSourceService.get(function(data){
        $scope.serverList = data.data_source_servers;
      });
    }

    $scope.deleteDataSource = function(id){
      DataSourceService.remove({ "id" : id }, function(){
        $scope.renderList();
      });
    }

    $scope.renderList();
  }
]);

/**
 * DATA SOURCE CREATE / UPDATE CONTROLLER
 */
Atlas.controller('DataSourceCreateController', [
  'DataSourceService',
  '$scope',
  '$routeParams',

  function(DataSourceService, $scope, $routeParams){
    $scope.data_source_server = {};

    $scope.cancelarApiServer = function(){
      $scope.data_source_server = {};
    }

    $scope.saveApiServer = function(){
      var data =  {
        "data_source_server" : $scope.data_source_server
      };

      if ($scope.data_source_server.id) {
        DataSourceService.update(data, function(){
          $scope.data_source_server = {};
        });
      }else{
        DataSourceService.save(data, function(){
          $scope.data_source_server = {};
        });
      }
    };

    if ($routeParams.id) {
      DataSourceService.get({ id : $routeParams.id }, function(data){
        $scope.data_source_server = data.data_source_server;
      });
    };
  }
]);


/**
 * DASHBOARD CRUD INDEX CONTROLLER
 */
Atlas.controller('DashboardIndexController', [
  '$scope',
  'Dashboards',

  function($scope, Dashboards){
    $scope.dashboardList = [];

    $scope.renderList = function(){
      Dashboards.get(function(data){
        $scope.dashboardList = data.dashboards;
      });
    }

    $scope.delete = function(id){
      var data = { "id" : id };
      Dashboards.remove(data, function(data){
        $scope.renderList();
        $scope.dashboard = {};
      });
    }

    $scope.renderList();
  }
]);

/**
 * DASHBOARD Create/Update CONTROLLER
 */
Atlas.controller('DashboardCreateController', [
  '$scope',
  'Dashboards',
  '$routeParams',

  function($scope, Dashboards, $routeParams){
    $scope.dashboard = {};

    $scope.salvar = function(){
      var data =  { "dashboard" : $scope.dashboard };

      if ($scope.dashboard.id) {
        Dashboards.update(data, function(){
          $scope.dashboard = {};
        });
      }else{
        Dashboards.save(data, function(data){
          $scope.dashboard = {};
        });
      }
    };

    $scope.cancelar = function(){
      $scope.dashboard = {};
    }

    if ($routeParams.id) {
      Dashboards.get({ id : $routeParams.id}, function(data){
        $scope.dashboard = data.dashboard;
      });
    };

  }
]);


/**
 * INDICATOR CONTROLLER
 */
Atlas.controller('indicatorController', [
  '$scope',
  'Indicators',

  function($scope, Indicators){
    $scope.data_types    = ['datetime', 'string', 'int'];
    $scope.indicatorList = [];
    $scope.indicator     = {
      "query" : {
        "parameters" : [],
      }
    };

    $scope.salvar = function(){
      $scope.indicator.query.parameters.forEach(function(el, i){
        if ((el.name === '' || el.name === null) && (el.default_value === '' || el.default_value === null))
          delete $scope.indicator.query.parameters[i];
      });

      var data =  { "indicator" : $scope.indicator };

      if ($scope.indicator.id) {
        Indicators.update(data, function(){
          $scope.renderList();
          $scope.indicator = {};
        });
      }else{
        Indicators.save(data, function(data){
          $scope.renderList();
          $scope.indicator = {};
        });
      }
    };

    $scope.renderList = function(){
      Indicators.get(function(data){
        $scope.indicatorList = data.indicators;
      });
    }

    $scope.loadIndicator = function(item){
      $scope.indicator = item;
    }

    $scope.addParam = function(){
      $scope.indicator.query.parameters.push({});
    }

    $scope.delete = function (id) {
      var data = { "id" : id };
      Indicators.remove(data, function(data){
        $scope.renderList();
        $scope.cancelar();
      });
    }

    $scope.cancelar = function(){
      $scope.indicator = {
        "query" : {
          "parameters" : [],
        }
      };
    }

    $scope.renderList();
  }
]);

/**
 * WIDGET CONTROLLER
 */
Atlas.controller('WidgetIndexController', [
  '$scope',
  'Widgets',

  function($scope, Widgets){
    $scope.widget     = {};
    $scope.widgetList = [];

    $scope.delete = function(id){
      Widgets.remove({ "id" : id },function(){
        $scope.renderList();
      });
    }

    $scope.renderList = function(){
      Widgets.get(function(data){
        $scope.widgetList = data.widgets;
      });
    }

    $scope.renderList();
  }
]);


/**
 * WIDGET CONTROLLER
 */
Atlas.controller('WidgetCreateController', [
  '$scope',
  'Widgets',
  'Indicators',
  'Dashboards',
  'WidgetTypes',
  '$routeParams',

  function($scope, Widgets, Indicators, Dashboards, WidgetTypes, $routeParams){
    $scope.widget     = {};
    $scope.widgetList = [];

    Indicators.get(function(data){
      $scope.availableIndicators = data.indicators;
    });

    Dashboards.get(function(data){
      $scope.availableDashboards = data.dashboards;
    });

    WidgetTypes.get(function(data){
      $scope.availableWidgetTypes = data.widget_types;
    });

    if ($routeParams.id) {
      Widgets.get({ id : $routeParams.id }, function(data){
        $scope.widget = data.widget;
      });
    };


    $scope.salvar = function(){
      var data =  { "widget" : $scope.widget };
      data.widget.indicator_id   = $scope.widget.indicator.id;
      data.widget.widget_type_id = $scope.widget.widget_type.id;

      if ($scope.widget.id) {
        Widgets.update(data, function(){
          $scope.cancelar();
        });
      }else{
        Widgets.save(data, function(){
          $scope.cancelar();
        });
      }
    };

    $scope.delete = function(id){
      Widgets.remove({ "id" : id },function(){
        $scope.renderList();
        $scope.cancelar();
      });
    }

    $scope.cancelar = function(){
      $scope.widget = {};
    };

  }
]);


/**
 * USERS CONTROLLER
 */
Atlas.controller('usersController', [
  '$scope',
  'Users',

  function($scope, Users){
    $scope.user     = {};
    $scope.userList = [];

    $scope.renderList = function(){
      Users.get(function(data){
        $scope.userList = data.users;
      });
    }

    $scope.cancelar = function(){
      $scope.user = {};
    };

    $scope.salvar = function(){
      var data =  { "user" : $scope.user };

      if ($scope.user.id) {
        Users.update(data, function(){
          $scope.renderList();
          $scope.cancelar();
        });
      }else{
        Users.save(data, function(){
          $scope.renderList();
          $scope.cancelar();
        });
      }
    };

    $scope.loadUser = function(item){
      $scope.user = item;
    }

    $scope.renderList();
  }
]);


/**
 * PERMISSIONS CONTROLLER
 */
Atlas.controller('permissionsController', [
  '$scope',
  'Permissions',
  'Users',
  'ApiServers',
  'Dashboards',

  function($scope, Permissions, Users, ApiServers, Dashboards){
    $scope.permission     = {};
    $scope.permissionList = [];

    Users.get(function(data){
      $scope.availableUsers = data.users;
    });

    ApiServers.get(function(data){
      $scope.availableApiServers = data.api_servers;
    });

    Dashboards.get(function(data){
      $scope.availableDashboards = data.dashboards;
    });

    $scope.salvar = function(){
      var data =  { "permission" : $scope.permission };

      if ($scope.permission.id) {
        Permissions.update(data, function(){
          $scope.renderList();
          $scope.permission = {};
        });
      }else{
        Permissions.save(data, function(){
          $scope.renderList();
          $scope.permission = {};
        });
      }
    };

    $scope.renderList = function(){
      Permissions.get(function(data){
        $scope.permissionList = data.permissions;
      });
    }

    $scope.delete = function (id) {
      var data = { "id" : id };
      Permissions.remove(data, function(data){
        $scope.renderList();
      });
    };

    $scope.cancelar = function(){
      $scope.permission = {};
    };

    $scope.loadPermission = function(item){
      $scope.permission = {
        "id" : item.id,
        "user_id" : item.user ? item.user.id : 0,
        "dashboard_id" : item.dashboard ? item.dashboard.id : 0,
        "api_server_id" : (item.api_server ? item.api_server.id : 0),
      };
    }

    $scope.renderList();
  }
]);


/**
 * CONSOLE CONTROLLER
 */
Atlas.controller('consoleController', [
  '$scope',
  'Statements',
  'Tables',
  'History',
  'zCodeMirror',

  function($scope, Statements, Tables, History, zCodeMirror){
    var code;

    $scope.showAdvancedOptions = true;
    $scope.showResults         = false;
    $scope.data_types          = ["varchar", "decimal", "integer", "date", "time", "timestamp"];
    $scope.isExecuting         = false;
    $scope.hasLimit            = true;
    $scope.results             = [];
    $scope.currentPage         = 1;
    $scope.errors              = [];
    $scope.historyItems        = [];

    $scope.validateParams = function(){
      for(var i = 0; i < $scope.statement.parameters.length; i++){
        var param = $scope.statement.parameters[i];
        if( param.name.trim() === '' || param.value.trim() === '')
          $scope.statement.parameters.splice(i,1);
      }
    }

    $scope.resetStatement = function(){
      $scope.statement = {
        parameters : [],
        sql : 'SELECT p.codproduto, p.codbarras, p.descricao1 FROM zw14ppro p WHERE p.situacao = \'N\'',
        limit : 100,
        offset : 0,
      };
      $scope.addParam();
    };

    $scope.addParam = function(){
      $scope.statement.parameters.push({
        name : "",
        value : "",
        type : "varchar",
        evaluated: false,
      });
    };

    $scope.deleteParam = function(key){
      $scope.statement.parameters.splice(key,1);
    }

    $scope.executeQuery = function(currentPage){
      $scope.validateParams();

      $scope.isExecuting   = true;

      zCodeMirror.save();
      $scope.statement.sql = zCodeMirror.getValue();


      if (currentPage) {
        $scope.currentPage += currentPage;
        $scope.statement.offset = $scope.statement.limit * $scope.currentPage;
      };


      var data  = { "statement" : $scope.statement };

      if (!$scope.hasLimit) {
        delete data.statement.limit;
        delete data.statement.offset;
      };

      Statements.execute(data, function(data){
        History.post($scope.statement);
        $scope.renderHistory();

        $scope.errors = [];
        $scope.isExecuting = false;
        $scope.showResults = true;

        if($scope.currentPage > 1)
          $scope.results.rows = $scope.results.rows.concat(data.statement.rows);
        else
          $scope.results = data.statement;

      }, function(err){
        $scope.isExecuting = false;
        if (err.status === 500)
          $scope.errors = [err.statusText];
        else if(err.status === 0)
          $scope.errors = ["Servidor indisponível"];
        else
          $scope.errors = err.data.errors.base || err.data.errors.sql;
      });
    };


    $scope.fetchTables = function(){
      $scope.isFetching = true;

      Tables.get(function(data){
        localStorage.setItem("tables", JSON.stringify(data.schema.tables));

        code.setOption("hintOptions",{
          tables: data.schema.tables
        });

      });
    }

    $scope.loadHistoryItem = function(row){
      $scope.statement = row.statement;
      zCodeMirror.setValue(row.statement.sql);
    }

    $scope.renderHistory = function(){
      History.get(function(data){
        $scope.historyItems = data;
      });
    }

    $scope.delete = function(id){
      History.delete(id, function(data){
        $scope.historyItems = data;
      });
    }

    $scope.getStyleType = function(type){
      switch(type){
        case "SELECT":
          return 'label-info';
      }
    },

    $scope.resetStatement();
    zCodeMirror.initialize(document.getElementById("statement"));
    zCodeMirror.setHints();
    zCodeMirror.setValue($scope.statement.sql);
    $scope.renderHistory();
  }
]);

/**
 * DASHBOARDS CONTROLLER
 */
Atlas.controller('dashboardsController', [
  '$scope',
  'Dashboards',
  function($scope, Dashboards){
    $scope.dashboards = [];

    Dashboards.get(function(data){
      $scope.dashboards = data.dashboards;
    });
  }
]);


/**
 * QUERIES CONTROLLER
 */
Atlas.controller('QueryListController', [
  '$scope',
  'Dashboards',
  'SourceService',

  function($scope, Dashboards, SourceService){
    $scope.queriesList = [];

    SourceService.get(function(data){
      $scope.queriesList = data.sources;
    });

  }
]);

/**
 * QUERIES CONTROLLER
 */
Atlas.controller('QueryCreateController', [
  '$scope',
  'Dashboards',
  'SourceService',
  '$routeParams',

  function($scope, Dashboards, SourceService, $routeParams){

    $scope.showAdvancedOptions = true;
    $scope.showResults         = false;
    $scope.data_types          = ["varchar", "decimal", "integer", "date", "time", "timestamp"];
    $scope.isExecuting         = false;
    $scope.hasLimit            = true;
    $scope.results             = [];
    $scope.currentPage         = 1;
    $scope.errors              = [];
    $scope.historyItems        = [];

    $scope.save = function(){
      $scope.validateParams();
      $scope.statement.type = "Query";

      var data = { source : $scope.statement };
      console.log(data);
      SourceService.update(data, function(data){
        console.log(data);
      });

    };

    $scope.validateParams = function(){
      for(var i = 0; i < $scope.statement.parameters.length; i++){
        var param = $scope.statement.parameters[i];
        if( param.name.trim() === '' || param.value.trim() === '')
          $scope.statement.parameters.splice(i,1);
      }
    };

    $scope.resetStatement = function(){
      $scope.statement = {
        parameters : [],
        sql : 'SELECT p.codproduto, p.codbarras, p.descricao1 FROM zw14ppro p WHERE p.situacao = \'N\'',
        limit : 100,
        offset : 0,
      };
      $scope.addParam();
    };

    $scope.addParam = function(){
      $scope.statement.parameters.push({
        name : "",
        value : "",
        type : "varchar",
        evaluated: false,
      });
    };

    $scope.deleteParam = function(key){
      $scope.statement.parameters.splice(key, 1);
    }

    if ($routeParams.id) {
      SourceService.get({ id : $routeParams.id }, function(data){
        $scope.statement = data.query;
      });
    }else
      $scope.resetStatement();
  }
]);

/**
 * DASHBOARDS DETAIL CONTROLLER
 */
Atlas.controller('dashboardDetailController', [
  '$scope',
  'Dashboards',
  '$routeParams',
  function($scope, Dashboards, $routeParams){

    $scope.dashboard = {
      id : $routeParams.id
    };

    Dashboards.get({ dashboard : { id : $routeParams.id } }, function(data){
      console.log(data);
    });

    $scope.indicadores = {
      periodo : {
        inicio    : (moment().subtract(29,'days').format("YYYY-MM-DD 00:00:00")),
        fim       : (moment().format("YYYY-MM-DD 00:00:00")),
        duracao   : function(grandeza) {
          var grandeza  = grandeza || 'days';
          var fim       = moment(Indicadores.periodo.fim);
          var inicio    = moment(Indicadores.periodo.inicio);
          var diferenca = fim.diff(inicio,grandeza);
          return diferenca + 1;
        },
      },
    };

    Dashboards.get(function(data){
      $scope.dashboards = data.dashboards;
    });
  }
]);
