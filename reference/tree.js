angular
  .module('digger.tree', [
    
  ])

  .directive('diggerTree', function($safeApply){


    //field.required && showvalidate && containerForm[field.name].$invalid
    return {
      restrict:'EA',
      scope:{
        root:'=',
        selected:'=',
        selector:'=',
        treetitle:'@',
        loadchildren:'&',
        icon:'&'
      },
      replace:true,
      templateUrl:"template/tree/tree.html",
      controller:function($scope){

        $scope.findicon = function(container){
          return 'icon-folder-close';
        }

        $scope.toggleopen = function(model){
          var container = $scope.mapmodel(model);
          var existing = container.data('open') || false;
          container.data('open', !existing);
          /*
          
            this means actually yes
            
          */
          if(!existing){
            $scope.loadcontainer(container);
          }
        }

        $scope.mapmodel = function(model){
          return $scope.container.spawn(model);
        }

        $scope.clickcontainer = function(model){
          var container = $scope.mapmodel(model);
          $scope.selected = container;
          $scope.loadcontainer(container);
          $scope.$emit('loadcontainer', container);
        }

        $scope.$on('digger:reload', function(){
          $scope.loadcontainer($scope.selected);
        })

        $scope.loadcontainer = function(container, done){
          if(!container){
            return;
          }

          container.data('open', true);

          container('> *:sort').ship(function(results){

            $safeApply($scope, function(){

              /*
              
                hard reset the children
                
              */
              container.get(0)._children = results.models;
              
              done && done();
            })
            
          })

        }
      },
      link:function($scope, elem, $attrs){
        $scope.$watch('root', function(root){
          if(!root){
            return;
          }
          console.log('-------------------------------------------');
          console.log('root changed');
          $scope.container = root;
          $scope.container.isroot = true;
          $scope.model = $scope.container.get(0);
          $scope.loadcontainer(root);

        })
/*
        $scope.$watch('selected', function(container){
          console.log('-------------------------------------------');
          console.log('selected');
          var treeone = $scope.root.find('=' + container.diggerid());
          if(!treeone){
            return;
          }
          //$scope.loadcontainer(treeone);
        })
*/
        $scope.$on('manualcontext', function(){
          $scope.selected = $scope.root;
        })

      }
    }
  })

  /*
  
    we put this one in the template cache so we can call ng-include on it
    
  */
  .run(["$templateCache", function($templateCache){

      /*
      
        Recursive tree view
        
      */
    $templateCache.put("template/tree/tree.html",
      [
  '<div class="digger-angular-tree">',
  '   <div>',
  '     <div ng-click="toggleopen(model);" class="treetoggle"> ',
  '       <div class="plusminus" ng-hide="model._data.open">+</div>',
  '       <div class="plusminus" ng-show="model._data.open">-</div>',
  '     </div>',
  '     <div class="treetitle" ng-class="{treehover:over || model._digger.diggerid==selected.diggerid()}" ng-click="clickcontainer(model);" ng-mouseenter="over=true" ng-mouseleave="over=false">',
  '       <i class="digger-icon {{ icon({container:model}) || \'icon-folder-close\' }}"></i>',
  '       <span ng-hide="container.isroot">{{model.name || model.title || model._digger.tag}}</span>',
  '       <span ng-show="container.isroot">{{treetitle}}</span>',
  '     </div>',
  '   </div>',
  '   <div ng-show="container.data(\'open\')">',
  '     <div class="children">',
  '       <div ng-repeat="model in model._children | orderBy:sortContainer" ng-include="\'template/tree/tree.html\'"></div>',
  '     </div>',
  '   </div>',
  '</div>'
      ].join("\n")
      );

  }]);