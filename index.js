require('digger-for-angular');
var template = require('./template');

function growl(message){
  $.bootstrapGrowl(message, {
    ele: 'body',
    type: 'info',
    offset: {from: 'top', amount: 20},
    align: 'right',
    width: 250,
    delay: 4000,
    allow_dismiss: true,
    stackup_spacing: 10
  });
}

angular
	.module('digger.folders', [
		'digger'
	])

  directive('diggerFolders', function($http, $location, $safeApply){
    return {
      restrict:'EA',
      scope:{
        // the root container with the things at the top
        root:'=',
        // what selector to use for loading children
        selector:'=',
        // the array of blueprints that apply
        blueprints:'=',
        // the title at the top of the tree
        treetitle:'@',
        // the filter for what appears in the tree
        treefilter:'@',
        // the function used for a container icon - defaults to ask blueprint
        iconfn:'=',
        // the settings for the viewer
        settings:'='
      },
      template: template,
      replace: true,
      controller:function($scope){

        /*
        
          a container has been choosen from the tree

          tell the viewer to open it
          
        */
        $scope.$on('tree:selected', function(ev, container){
          
          /*
          $scope.add_parent_container = null;
          $scope.viewer_container = $scope.tree_root.find('=' + container.diggerid());
          $scope.viewer_blueprint = $digger.blueprint.get(container.tag());

          if(container.match($scope.filter)){
            $scope.$broadcast('viewer:mode', 'children');
          }
          */

        })

        /*
        
          open a container
          
        */
        $scope.$on('viewer:selected', function(ev, container){

          /*
          $scope.add_parent_container = null;
          $scope.viewer_container = container;
          $scope.viewer_blueprint = $digger.blueprint.get(container.tag());

          if(container.match($scope.filter)){
            $scope.$broadcast('viewer:mode', 'children');
          }

          $scope.$broadcast('tree:setselected', container.get(0));
          */
        })

        /*
        
          restore from cancelling an add
          
        */
        $scope.$on('viewer:canceladd', function(ev){
          /*
          $scope.viewer_container = $scope.add_parent_container;
          $scope.viewer_blueprint = $scope.add_parent_blueprint;
          $scope.$broadcast('viewer:mode', 'children');
          */
        })

        /*
        
          added from viewer
          
        */
        $scope.$on('viewer:add', function(ev, blueprint){

          /*
          $scope.add_parent_container = $scope.viewer_container;
          $scope.add_parent_blueprint = $scope.viewer_blueprint;

          blueprint.fields = blueprint.find('field').models
          $scope.viewer_container = $digger.create(blueprint.attr('name'));
          $scope.viewer_container.data('new', true);
          $scope.viewer_blueprint = blueprint;
          */

        })

        /*
        
          removal from viewer - they have clicked OK
          
        */
        $scope.$on('viewer:remove', function(ev){

          /*
          $scope.viewer_container.remove().ship(function(){
            growl($scope.viewer_container.title() + ' removed');
            var parent = $scope.tree_root.find('=' + $scope.viewer_container.diggerparentid());

            if(!parent || parent.count()<=0){
              parent = $scope.tree_root;
            }


            $safeApply($scope, function(){
              $scope.something_removed = true;
              check_folders_step();
              $scope.viewer_container = parent;
              $scope.viewer_blueprint = $digger.blueprint.get(parent.tag());
              $scope.$broadcast('viewer:mode', 'children');
              $scope.add_parent_container = null;
              $scope.$broadcast('tree:setselected', parent.get(0));
            })
            
          })
          */
        })


        $scope.$watch('viewer_container', function(container){
          /*
          if(!container){
            return;
          }

          if(container.diggerid()==$scope.tree_root.diggerid()){
            
            $scope.viewersettings.container_url = $scope.warehouse_url;
          }
          else{
            $scope.viewersettings.container_url = $scope.warehouse_url + '/' + container.diggerid();
          }
          */
        })

        /*
        
          when the core models change update the HTML view
          
        */
        $scope.$watch('tree_root.models', function(models){

          /*
          if(!models){
            return;
          }

          $scope.htmlmodel = models[0];
          */

        }, true)

        $scope.$on('viewer:save', function(ev){

          // this means new container
          
          /*
          $scope.viewer_container.data('tree_filter', $scope.viewer_container.match('folder'));
          if($scope.add_parent_container){
            $scope.add_parent_container.append($scope.viewer_container).ship(function(){
              $safeApply($scope, function(){
                $scope.something_added = true;
                check_folders_step();
                $scope.viewer_container.data('new', false);
                $scope.add_parent_container.data('expanded', true);
                growl($scope.viewer_container.title() + ' added');
                $scope.viewer_container = $scope.add_parent_container;
                $scope.viewer_blueprint = $scope.add_parent_blueprint;
                $scope.$broadcast('viewer:mode', 'children');
                $scope.add_parent_container = null;
              })
            })
          }
          else{
            $scope.viewer_container.save().ship(function(){
              growl($scope.viewer_container.title() + ' saved');
              $safeApply($scope, function(){
                $scope.something_saved = true;
                check_folders_step();
                if($scope.viewer_container.tag()=='folder'){
                  $scope.$broadcast('viewer:mode', 'children');
                }
              })
              
            })
          }
          */
        })
      },
      link: function($scope, iElm, iAttrs, controller) {
        
      }
    };
  })