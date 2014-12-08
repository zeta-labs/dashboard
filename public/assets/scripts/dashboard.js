﻿moment.locale('pt-br');
var timer;

var Indicadores = {

  situacao : "'LOC Locado'",

  items : {
    "volumeVendasTotal" : false
  },

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

  statements : {
    valorTotalReceita   : "SELECT SUM(f.valorprevisao) AS \"VALOR_TOTAL_RECEITA\" FROM zw14fflu f WHERE f.modalidade IN ('P','R') AND f.estimativa = 'C' AND f.pagarreceber = 'R' AND {FN TIMESTAMPADD (SQL_TSI_DAY, f.datafluxo-72687, {D '2000-01-01'})} BETWEEN {TS :inicio} AND {TS :fim}",
    valorInadimplencia  : "SELECT SUM(f.valorprevisao) AS \"VALOR_INADIMPLENCIA\" FROM zw14fflu f WHERE f.modalidade = 'P' AND f.estimativa = 'C' AND f.pagarreceber = 'R' AND {FN TIMESTAMPADD (SQL_TSI_DAY, f.datafluxo-72687, {D '2000-01-01'})} BETWEEN {TS :inicio} AND {TS :fim}",
    volumeVendasTotal   : "SELECT {FN CONVERT(SUM(p.valortotal), SQL_FLOAT)} AS \"VOLUME_VENDAS\" FROM zw14vped p WHERE p.situacao = :situacao AND {FN TIMESTAMPADD (SQL_TSI_DAY, p.dataemiss-72687, {D '2000-01-01'})} BETWEEN {TS :inicio} AND {TS :fim}",
    contratosPeriodo    : "SELECT COUNT(*) AS \"CONTRATOS_PERIODO\" FROM zw14vped p WHERE p.situacao = :situacao AND {FN TIMESTAMPADD (SQL_TSI_DAY, p.dataemiss-72687, {D '2000-01-01'})} BETWEEN {TS :inicio} AND {TS :fim}",
    novosContratosDia   : "SELECT {FN CONVERT({FN TIMESTAMPADD (SQL_TSI_DAY, p.dataemiss-72687, {D '2000-01-01'})},SQL_DATE)} AS \"DATA_EMISSAO\", count(*) AS \"QUANTIDADE\" FROM zw14vped p WHERE  p.situacao = :situacao  AND {FN TIMESTAMPADD (SQL_TSI_DAY, p.dataemiss-72687, {D '2000-01-01'})}   BETWEEN {TS :inicio} AND {TS :fim} GROUP BY  p.dataemiss  ORDER BY  p.dataemiss DESC",
    clientesMaisLocaram : "SELECT V.NOMECLIENTE AS \"CLIENTE\", {FN CONVERT({FN ROUND(SUM(V.VALORTOTALGERAL),2)},SQL_FLOAT)} AS \"TOTAL\" FROM ZW14VPED V WHERE V.SITUACAO = :situacao AND {FN TIMESTAMPADD (SQL_TSI_DAY, V.DATAEMISS-72687, {D '2000-01-01'})} BETWEEN {TS :inicio} AND {TS :fim} GROUP BY V.NOMECLIENTE ORDER BY 1",
    pedidosPorSituacao  : "SELECT p.situacao AS \"SITUACAO\", count(*) AS \"QUANTIDADE\" FROM  zw14vped p WHERE p.situacao IS NOT NULL AND {FN TIMESTAMPADD (SQL_TSI_DAY, p.dataemiss-72687, {D '2000-01-01'})} BETWEEN {TS :inicio} AND {TS :fim} GROUP BY   p.situacao"
  }

};

var Dashboard = {

  renderGraph : function(data){
    var valores    = Dashboard.prepareDataset(data.statement.rows);
    valores.labels = valores.labels.length > 31 ? false : valores.labels;

    $('#volume-vendas').highcharts({
      colors : ['#3498DB', "#16A085"],
      chart: {
        type: 'areaspline',
        zoomType : 'x',
        panning: true,
        panKey: 'shift',
        resetZoomButton: {
          theme: {
            fill: '#2c3e50',
            stroke: '#2c3e50',
            style: {
              color: 'white',
            },
            r: 0,
            states: {
              hover: {
                fill: '#1a242f',
                stroke: '#2c3e50',
                style: {
                  color: 'white',
                  cursor: "pointer"
                }
              }
            }
          }
        }
      },
      title : {
        text : "<h3>Novos contratos por dia</h3>",
        useHtml : true,
        style : {
          fontFamily : "Lato, 'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize : '19px'
        }
      },
      legend: {
          layout: 'vertical',
          align: 'left',
          verticalAlign: 'top',
          x: 150,
          y: 100,
          floating: true,
          borderWidth: 1,
          backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
      },
      xAxis: {
          categories: valores.labels,
          plotBands: valores.plotBands,
          labels : { maxStaggerLines : 1 }
      },
      yAxis: {
          title: {
              text: false
          }
      },
      tooltip: {
          shared: true,
          valuePreffix: 'R$ '
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        areaspline: {
          fillOpacity: 0.5
        }
      },
      series: [
        { name: 'Contratos', data : valores.contratosDia},
      ]
    });

  },

  renderPie : function(el, dataset, colors, title){
    var serie    = 'Quantidade';

    $(el).highcharts({
      colors : colors,
      // colors : ["rgb(16, 76, 69)", "rgb(18, 104, 92)", "rgb(20, 132, 115)", "rgb(22, 160, 133)", "rgb(24, 188, 156)", "rgb(26, 216, 179)", "rgb(28, 244, 202)"],
      chart: {
        type: 'pie',
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false
      },
      credits: {
        enabled: false
      },
      legend : false,
      plotOptions: {
        pie: {
          borderColor: '#FFF',
          innerSize: '60%',
          dataLabels: {
            enabled: false
          }
        }
      },
      title: {
        text: title,
        useHtml : true,
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      series: [{
        type: 'pie',
        name: serie,
        data: dataset
      }]
    },
    function(chart) {
      var xpos = '50%';
      var ypos = '53%';
      var circleradius = 102;

      chart.renderer.circle(xpos, ypos, circleradius).attr({
          fill: '#fff'
      }).add();
    });

  },

  prepareDataset : function(rows){
    var dataSet   = [];

    var dataAtual = moment(Indicadores.periodo.inicio).format("YYYY-MM-DD");
    var dataFinal = moment(Indicadores.periodo.fim).format("YYYY-MM-DD");

    var valores   = {
      contratosDia       : [],
      labels             : [],
      plotBands          : []
    };

    /**
     * Procura nas linhas se existe valor para todos os dias,
     * se não existir insere a data e valor zero no array das linhas
     */
    while(dataAtual <= dataFinal){
      var find = _.find(rows, function(el) {
        return (el[0] === dataAtual);
      });

      find === undefined ? dataSet.push([dataAtual,0,0,0,0]) : dataSet.push(find);

      dataAtual = moment(dataAtual).add(1, 'day').format("YYYY-MM-DD");
    }


    $.each(dataSet, function(el, val){
      data      = val[0].split('-');
      diaSemana = moment(val[0]).format('dd');

      valores.labels.push(diaSemana + ' ' + data[2]);
      valores.contratosDia.push(val[1]);
      // valores.valorMedioDoPedido.push(val[4]);

      if (diaSemana === 'sáb') {
        valores.plotBands.push({
          from: el - 0.5,
          to: el + 1.5,
          color: 'rgba(192, 192, 192, .2)'
        });
      }

    });

    return valores;

  },

  /**
   * @var statement query a ser executada
   **/
  getStatement : function(statement, params){
    return $.ajax({
      type: "POST",
      contentType: "application/json",
      url: API.address + '/statements',
      data: JSON.stringify({
          "statement": {
            "sql"    : statement,
            "params" : params
          }
        })
    })
    .fail(function(err){
      $(".container > .alert").remove();
      var message = getErrorMessage(err);
      $(".container").prepend('<div data- class="alert alert-dismissable alert-danger"><button type="button" class="close" data-dismiss="alert">×</button><strong>Oh snap! </strong>'+message+'</div>');
      if (err.status === 0) {
        verifyServer();
      };
    })

  },

  /**
   * @var container el que contém o loader
   * @showHide "show" ou "hide", default pra "show", força o status do loader
   */
  loader : function(container, showHide){
    var container  = container || '.container';
    var loader     = $(container).find('.loader');
    var forceReset = showHide || 'show';
    var opacity    = showHide === 'hide' ? 0 : 1;

    $(loader).finish().animate({ opacity: opacity }, function(){
      opacity == 1 ? $(this).show() : $(this).hide();
    });
  },

  initDaterangepicker : function(){
    $('#reportrange').daterangepicker(
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
        format : 'DD/MM/YYYY',
        showDropdowns : true,
        startDate: moment({year : 2013,month : 10, day : 1}),
        endDate: moment({year : 2013,month : 10, day : 30}),
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
      function(start, end, range) {
          var text;
          if (range !== undefined && range !== "Personalizado") {
            text = range;
          }else{
            var formato = "D [de] MMMM";
            if (start.format('YYYY') === end.format('YYYY')) {
              if (start.format('MMMM') === end.format('MMMM')) {
                formato = 'D';
              };
            }else{
              formato = 'D [de] MMMM, YYYY';
            }
            text = start.format(formato) + '  até  ' + end.format('D [de] MMMM, YYYY');
          }

          $('[data-behaivor=show-actual-date]').html(text);

          Indicadores.periodo.inicio = start.format("YYYY-MM-DD 00:00:00");
          Indicadores.periodo.fim    = end.format("YYYY-MM-DD 00:00:00");

          Dashboard.loader('.container', true);
          Dashboard.fetchIndicadores();
      }
    );
  },

  renderIndicador : function(container, qtd){
    var qtd = NumberHelpers.number_to_human(qtd, {
        labels : { thousand : 'mil', million : 'Mi', billion : 'Bi', trillion : 'Tri' },
        precision: 3,
        significant : true,
        separator : ",",
        delimiter : '.'
    });

    valores = qtd.split(' ');

    if (valores.length > 1)
      $(container).find('.grandeza').html(valores[1]);

    $(container).find('.valor').html(valores[0]);
  },

  fetchIndicadores : function(){
    var params = {
      situacao  : Indicadores.situacao,
      inicio    : "'" + (moment({ day: 01, month : 01, year : 2000 }).format("YYYY-MM-DD 00:00:00")) + "'",
      fim       : "'" + Indicadores.periodo.fim + "'",
      duracao   : Indicadores.periodo.duracao()
    };


    /* Volume total de vendas */
    Dashboard.getStatement(Indicadores.statements.volumeVendasTotal, params).done(function(data){
      var valor = data.statement.rows[0][0] || 0;
      Indicadores.items.volumeVendasTotal = valor;
      Dashboard.renderIndicador('[data-type=volume-total-de-vendas]', valor);
      Dashboard.loader("[data-type=volume-total-de-vendas]", 'hide');
    });


    /* Contratos Ativos */
    Dashboard.getStatement(Indicadores.statements.contratosPeriodo, params).done(function(data){
      var valor = data.statement.rows[0][0] || 0;
      Dashboard.renderIndicador('[data-type=contratos-ativos]', valor);
      Dashboard.loader("[data-type=contratos-ativos]", 'hide');
    });


    /* Novos Contratos */
    params.inicio = "'" + Indicadores.periodo.inicio + "'";
    Dashboard.getStatement(Indicadores.statements.contratosPeriodo, params).done(function(data){
      var valor = data.statement.rows[0][0] || 0;
      Dashboard.renderIndicador('[data-type=contratos-novos]', valor);
      Dashboard.loader("[data-type=contratos-novos]", 'hide');
    });

    /* PIE - Clientes que mais compraram */
    function  chamaMaisClientes(){
      window.clearInterval(timer);
      Dashboard.getStatement(Indicadores.statements.clientesMaisLocaram, params).done(function(data){
        var colors  = ['#1abc9c', "#2ecc71", "#e74c3c", "#e67e22", "#f1c40f", "#3498db", "#9b59b6", "#34495e","#95a5a6", "#ecf0f1" ].reverse();
        var dataset = [];
        var percentual;
        var total   = 0;

        if(data.statement.rows.length > 0){
          var produtos = (data.statement.rows).sort(function(a,b){
            if (a[1] > b[1])
              return -1;
            if (a[1] < b[1])
              return 1;
            return 0;
          });

          for (var i = 0; i < 9; i++) {
            percentual = (produtos[i][1] * 100) / Indicadores.items.volumeVendasTotal;
            dataset.push([ $.trim(produtos[i][0].toUpperCase()), percentual ]);
            total += percentual;
          };
          dataset.push([ "OUTROS", 100 - total ]);
        }
        Dashboard.renderPie('[data-type=clientes-mais-compraram] .pie', dataset, colors, '<h3>Clientes que mais locaram (%)</h3>');
        Dashboard.loader('[data-type=clientes-mais-compraram]', 'hide');
      });
    }

    Dashboard.getStatement(Indicadores.statements.pedidosPorSituacao, params).done(function(data){
      var colors  = ['#1abc9c', "#2ecc71", "#e74c3c", "#e67e22", "#f1c40f", "#3498db", "#9b59b6", "#34495e","#95a5a6", "#ecf0f1" ];
      var dataset = [];
      var percentual;
      var total   = 0;

      if(data.statement.rows.length > 0){
        var produtos = (data.statement.rows).sort(function(a,b){
          if (a[1] > b[1])
            return -1;
          if (a[1] < b[1])
            return 1;
          return 0;
        });

        for (var i = 0; i < produtos.length; i++) {
          percentual = produtos[i][1];
          dataset.push([ $.trim(produtos[i][0].toUpperCase()), percentual ]);
          total += percentual;
        };
        // dataset.push([ "OUTROS", 100 - total ]);
      }
      Dashboard.renderPie('[data-type=pedidos-por-situacao] .pie', dataset, colors, '<h3>Pedidos por situação</h3>');
      Dashboard.loader('[data-type=pedidos-por-situacao]', 'hide');
    });


    timer = window.setInterval(function(){
      if (Indicadores.items.volumeVendasTotal !== false){
        chamaMaisClientes();
      }
    }, 300);

    /* Novos Contratos por Dia */
    Dashboard.getStatement(Indicadores.statements.novosContratosDia, params).done(function(data){
      Dashboard.renderGraph(data);
      Dashboard.loader(".grafico-content", 'hide');
    });


    /* Inadimplencia */
    params.inicio = "'" + moment(Indicadores.periodo.inicio).subtract('1', 'year').format('YYYY-MM-DD 00:00:00') + "'";
    params.fim    = "'" + Indicadores.periodo.inicio + "'";
    var valorTotal    = Dashboard.getStatement(Indicadores.statements.valorTotalReceita, params);
    var inadimplencia = Dashboard.getStatement(Indicadores.statements.valorInadimplencia, params);
    $.when(valorTotal, inadimplencia).done(function( v1, v2){
      var valorTotal = v1[0].statement.rows[0][0];
      var inadimplencia = v2[0].statement.rows[0][0];

      Dashboard.renderIndicador('[data-type=percentual-inadimplentes]', (inadimplencia / valorTotal) * 100);
      Dashboard.loader("[data-type=percentual-inadimplentes]", 'hide');
    });


  },

  init : function(){
    Dashboard.initDaterangepicker();
    $('[data-behaivor=show-actual-date]').html('Últimos 30 dias');
    Dashboard.fetchIndicadores();

    $('#popover').popover({
      html : true,
      placement : "top",
      content : "<p> Também chamado de <strong>Ticket Médio</strong>, vai auxiliá-lo a prever desde o momento do <a href='#'>retorno do investimento</a> até esforços de marketing para aumentar margens de lucro global para o seu negócio. A métrica é simples: cada vez que você faz uma venda, em média, você vai conseguir que o cliente gaste X reais. </p>",
      title : "Valor médio do pedido",
      trigger : 'focus'
    });
  }
};

$(Dashboard.init);

function getErrorMessage(xhr) {
  if (xhr.responseJSON !== undefined &&  xhr.responseJSON.errors !== undefined ) {
    return xhr.responseJSON.errors.replace(/.*\[SoftVelocity Inc\.\]\[TopSpeed ODBC Driver\](\[ISAM\]ISAM)?/,"");
  } else if (xhr.status === 0) {
    return "There was an unexpected error when accessing the server.";
  } else {
    return xhr.statusText;
  }
}

function verifyServer (){
  $.get(API.address + '/ping', function(data) {
      $(".container > .alert").remove();
      var message  = "Estamos de volta :D";
      $(".container").prepend('<div class="alert alert-dismissable alert-success"><button type="button" class="close" data-dismiss="alert">×</button><strong>Oh great! </strong>'+message+'</div>');
      return false;
  }).fail(function(xhr){
    setTimeout(function () {
      verifyServer();
    }, 1500);
  });
}

function prepareStatement(statement, params){
  $.each(params, function(index, value){
    tokens    = statement.split(':' + index);
    statement = tokens.join(value);
  });

  return statement.match(/\s\:([a-zA-Z0-9]+[a-zA-Z0-9_]*\b)/g) || statement;
}