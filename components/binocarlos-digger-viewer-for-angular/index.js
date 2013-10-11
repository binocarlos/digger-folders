/*

  we are in private scope (component.io)
  
*/
var template = require('./template');

angular
  .module('digger.viewer', [
    
  ])


  .directive('diggerViewer', function($safeApply){

    //field.required && showvalidate && containerForm[field.name].$invalid
    return {
      restrict:'EA',
      scope:{
        container:'=',
        blueprint:'=',
        iconfn:'=',
        extra_fields:'=',
        settings:'='
      },
      replace:true,
      template:template,
      controller:function($scope){

      	$scope.tabmode = 'children';
        $scope.diggeractive = true;

        $scope.hidedelete = function(){
          if(!$scope.settings){
            return false;
          }

          var mode = $scope.settings.nodelete;

          if(typeof(mode)==='function'){
            return mode();
          }
          else{
            return mode;
          }
        }

        $scope.toggledigger = function(){
          $scope.diggeractive = !$scope.diggeractive;
        }

        $scope.geticon = function(container){
          return $scope.iconfn ? $scope.iconfn(container) : 'icon-file';
        }

        $scope.setmode = function(mode){
          $scope.tabmode = mode;
          $scope.deletemode = false;
        }

        $scope.$on('viewer:mode', function(ev, mode){
          $scope.setmode(mode);
        })
        
        $scope.$watch('container', function(container){
          if(!container){
            return;
          }

          $scope.children = container.children().containers();

          $scope.deletemode = false;

          var addchildren = $digger.blueprint.get_children($scope.blueprint);
          $scope.addchildren = addchildren ? addchildren.containers() : [];
          $scope.showchildren = $digger.blueprint.has_children($scope.blueprint);
          if(container.data('new')){
            $scope.showchildren = false;
          }
          $scope.showdetails = $digger.blueprint ? true : false;
          $scope.edit_container = container;

          if(!$scope.showchildren){
            $scope.tabmode = 'details';
          }

          $scope.digger_fields = [{
            name:'_digger.tag',
            title:'<tag>'
          },{
            name:'_digger.class',
            type:'diggerclass',
            title:'.class'
          },{
            name:'_digger.id',
            title:'#id'
          }]
        })

        $scope.add_from_blueprint = function(blueprint){
          $scope.$emit('viewer:add', blueprint);
          $scope.addmode = true;
        }

        $scope.deletemode = false;

        $scope.click_container = function(container){
          $scope.$emit('viewer:selected', container);
        }

        $scope.cancelcontainer = function(){
          $scope.$emit('viewer:canceladd');
          $scope.addmode = false;
        }

        $scope.canceldelete = function(){
          $scope.deletemode = false;
        }

        $scope.deletecontainer = function(confirm){
          if(!confirm){
            $scope.deletemode = true;
          }
          else{
            $scope.$emit('viewer:remove');
            $scope.deletemode = false;
          }
        }

        $scope.savecontainer = function(){
          $scope.$emit('viewer:save');
        }
      }
    }
  })