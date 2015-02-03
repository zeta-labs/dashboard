(function(){
  'use strict';

  angular.module('Atlas')

  .directive('integer', function(){
    return {
      require: 'ngModel',
      link: function(scope, ele, attr, ctrl){
        ctrl.$parsers.unshift(function(viewValue){
          return parseInt(viewValue, 10);
        });
      }
    };
  })

  .directive('zCheckbox', function() {
    return {
      restrict: 'E',
      require: 'ngModel',
      scope: {
        "checkbox" : '=ngModel'
      },
      template: '<div class="atlCheckbox" ng-class="{\'atlCheckbox_checked\' : checkbox }">' +
        '<input type="checkbox" ng-model="checkbox">' +
        '</div>',

      link: function(scope, element, attr, ngController) {

        element.on({
          "mouseenter": function(event){
            element.children(1).addClass('atlCheckbox_hover');
          },
          "focusin": function(event){
            element.children(1).addClass('atlCheckbox_hover');
          },
          "mouseleave": function(event){
            element.children(1).removeClass('atlCheckbox_hover').removeClass('.atlCheckbox_active');
          },
          "focusout": function(event){
            element.children(1).removeClass('atlCheckbox_hover');
          }
        });
      }
    };
  })

  .directive('zExecutions', function() {
    return {
      restrict: 'E',
      templateUrl: '/admin/origem/zExecutions.html',
      link: function($scope, element, attr, ngController) {

        /**
         * Move o box para cima e para baixo
         * @param  Integer key indice do array
         * @param  String dir 'up', 'down'
         */
        $scope.move = function(key, dir){
          $scope.aggregation.executions.map(function(elem, index) {
            elem.order = index;
            return elem;
          });

          var aux;
          for (var i = 0; i < $scope.aggregation.executions.length; i++) {
            var index = (dir === 'down') ? i+1 : i-1;

            if ( key === i ) {
              aux = $scope.aggregation.executions[i];
              $scope.aggregation.executions[i]   = $scope.aggregation.executions[index];
              $scope.aggregation.executions[index] = aux;
            };
          };
        }

        /* Se houver ID então pede para excluir, senão remove do array */
        $scope.deleteExecution = function(key){
          if (window.confirm("Você tem certeza que deseja deletar essa operação?")) {
            if($scope.aggregation.executions[key].id)
              $scope.aggregation.executions[key]._destroy = true;
            else
              $scope.aggregation.executions.splice(key, 1);
          };
        }

        $scope.loadParametersFromFunction = function(execution){
          var i  = 0;
          var fn = false;

          while(i < $scope.functionList.length || fn === false){
            if($scope.functionList[i].id === execution.function_id){
              fn = $scope.functionList[i];
            }
            i++;
          }
          execution.parameters = fn.parameters;
        }

      }
    };
  })

  .directive('zWidgetStatus', function() {
    return {
      restrict: 'E',
      templateUrl: '/admin/widget/tplStatus.html',
      link: function($scope, element, attr, ngController) {

      }
    };
  })

  .directive('zWidgetLine', function() {
    return {
      restrict: 'E',
      templateUrl: '/admin/widget/tplLine.html',
      link: function($scope, element, attr, ngController) {

      }
    };
  })

  .directive('zWidgetPie', function() {
    return {
      restrict: 'E',
      templateUrl: '/admin/widget/tplPie.html',
      link: function($scope, element, attr, ngController) {

      }
    };
  })

  .directive('zErrorbox', [function(){
    return {
      scope: {
        'errors' : '=ngModel'
      },
      require: 'ngModel',
      restrict: 'EA',
      template: '<div class="alert alert-dismissable alert-danger" ng-show="errors.length"><button type="button" class="close" ng-click="clearErrors()"> <span aria-hidden="true">×</span> </button><strong>Oh snap! </strong><p ng-repeat="err in errors">{{ err }}</p></div>',
      link: function($scope, iElm, iAttrs, controller) {

        $scope.clearErrors = function(){
          $scope.errors = [];
        }

      }
    };
  }])

  .directive('zAlertbox', [function(){
    return {
      scope: {
        'alert' : '=ngModel'
      },
      require: 'ngModel',
      restrict: 'EA',
      templateUrl: '/assets/templates/zAlertbox.html',
      link: function($scope, iElm, iAttrs, controller) {

        $scope.clearMessages = function(){
          $scope.alert = {
            'type' : '',
            'messages' : []
          };
        }

      }
    };
  }])

  .directive('zFloatthead', ['$timeout', function($timeout){
    return {
      scope: {
        'results' : '=ngModel'
      },
      require: 'ngModel',
      restrict: 'EA',
      templateUrl: '/assets/templates/zFloatThead.html',
      link: function($scope, iElm, iAttrs, controller) {

        function loadFloatThead(){
          $table = iElm.find('.table');
          $table.floatThead('destroy');
          $timeout(function(){
            $table.floatThead({
                scrollContainer: function($table){
                return $table.closest('.wrapper');
              }
            });
          }, 500);
        }

       // iElm.on('$destroy', function() {
       //   $table.floatThead('destroy');
       // });

        $scope.$watch('results', function(value){
          var records = value.records || 0;
          if(records > 0)
           loadFloatThead();
        });


      }
    };
  }])

  .directive('zDaterangepicker', [function($timeout){
    return {
      scope: {
        'indicadores' : '=ngModel',
        'loadWidgets'  : '&callback'
      },
      require: 'ngModel',
      restrict: 'EA',
      link: function(scope, el, attrs, controller) {
        var hasInputDate = verifyInputDate();
        var format       = hasInputDate ? 'YYYY-MM-DD' : 'DD/MM/YYYY';

        function verifyInputDate(){
          var i = document.createElement("input");
            i.setAttribute("type", "date");
          return i.type !== "text";
        }

        function callbackDatePicker(start, end, range){
          var text;
          if (range !== undefined && range !== "Personalizado") {
            text = range;
          }
          else {
            var formato = "D [de] MMMM";
            if (start.format('YYYY') === end.format('YYYY')) {
              if (start.format('MMMM') === end.format('MMMM')) {
                formato = 'D';
              };
            }
            else {
              formato = 'D [de] MMMM, YYYY';
            }
            text = start.format(formato) + '  até  ' + end.format('D [de] MMMM, YYYY');
          }

          $('[data-behaivor=show-actual-date]').html(text);

          if (scope.indicadores) {
            scope.indicadores.periodo.inicio = start.format("YYYY-MM-DD 00:00:00");
            scope.indicadores.periodo.fim    = end.format("YYYY-MM-DD 00:00:00");
          };

          if (typeof scope.loadWidgets === "function") {
            scope.loadWidgets();
          };
        }

        el.daterangepicker(
          {
            ranges: {
              'Hoje': [moment(), moment()],
              'Ontem': [moment().subtract(1,'days'), moment().subtract(1,'days')],
              'Últimos 7 Dias': [moment().subtract(6,'days'), moment()],
              'Últimos 30 Dias': [moment().subtract(29,'days'), moment()],
              'Últimos 90 Dias': [moment().subtract(89,'days'), moment()],
              'Este Mês': [moment().startOf('month'), moment().endOf('month')],
              'Último Mês': [moment().subtract(1,'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            format : format,
            showDropdowns : true,
            minDate : moment({year : 2000, month: 0, day: 1}),
            maxDate : moment().add(1, 'month'),
            startDate: moment().subtract(29,'days'),
            endDate: moment(),
            locale: {
              applyLabel: 'Aplicar',
              cancelLabel: 'Limpar',
              fromLabel: 'De',
              toLabel: 'Para',
              customRangeLabel: 'Personalizado',
              daysOfWeek: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex','Sab'],
              monthNames: ['Janeiro', 'Favereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            }
          },
          callbackDatePicker
        );

        $('.daterangepicker').css('width', $(el).closest('.toolbar').innerWidth() - 30 + 'px');

        if(hasInputDate){
          $('[name=daterangepicker_start]').attr('type','date');
          $('[name=daterangepicker_end]').attr('type','date');
        }
      }
    };
  }])

  .directive('fastRepeat', ['$timeout', function($timeout){
    return {
      restrict: 'E',
      scope: {
        data: '='
      },
      link : function(scope, el, attrs) {
        scope.$watchCollection('data', function(newValue, oldValue){
          if (newValue) {
            var records = newValue.fetched || 0;

            React.render(
              RTable(newValue),
              el[0],
              loadFloatThead(records)
            );
          };
        });

        function loadFloatThead(records){
          if (records > 0) {
            $table = el.find('.table-float-thead');
            $table.floatThead('destroy');
            $timeout(function(){
              $table.floatThead({
                scrollContainer: function($table){
                  return $table.closest('.wrapper');
                }
              });
            }, 100);
          }
        }

        el.on('$destroy', function() {
          $table = el.find('.table');
          $table.floatThead('destroy');
        });

      }
    }
  }])
})();