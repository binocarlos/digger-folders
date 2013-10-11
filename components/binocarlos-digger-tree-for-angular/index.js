/*

  we are in private scope (component.io)
  
*/
require('digger-utils-for-angular');
require('bootstrap-tree-for-angular');

var template = require('./template');

angular
  .module('digger.tree', [
    'digger.utils',
    'angularBootstrapNavTree'
  ])


  .directive('diggerTree', function($safeApply){

    //field.required && showvalidate && containerForm[field.name].$invalid
    return {
      restrict:'EA',
      scope:{
        container:'=',
        selectedid:'=',
        title:'=',
        iconfn:'=',
        filter:'@',
        depth:'='
      },
      replace:true,
      transclude:true,
      template:template,
      controller:function($scope){

        $scope.depth = $scope.depth || 4;
        $scope.treedata = [];
        
        $scope.$watch('container', function(container){
          if(!container){
            return;
          }

          var warehouse = container.diggerwarehouse();

          container.recurse(function(c){
            c.attr('label', c.title());
            if(!c.diggerwarehouse()){
              c.diggerwarehouse(warehouse);
            }
            if($scope.filter){
              c.data('tree_filter', c.match($scope.filter));
            }
            if($scope.iconfn){
              c.data('tree_icon', $scope.iconfn(c));
            }
          })

          if(!($scope.title || '').match(/\w/)){
            $scope.title = container.title();
          }

          $scope.treedata = container.models;
        })

        $scope.container_select = function(model){
          $scope.$emit('tree:selected', $scope.container.spawn(model));
        }
      }
    }
  })