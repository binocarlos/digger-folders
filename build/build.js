
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("binocarlos-bootstrap-tree-for-angular/dist/abn_tree_directive.js", function(exports, require, module){
var module;
var template = require('./abn_tree_template.js')
module = angular.module('angularBootstrapNavTree', []);

module.directive('abnTree', function($timeout) {
  return {
    restrict: 'E',
    template: template,
    scope: {
      treeData: '=',
      onSelect: '&'      
    },
    link: function(scope, element, attrs) {
      var expand_level, for_each_branch, on_treeData_change, select_branch, selected_branch;
      if (attrs.iconExpand == null) {
        attrs.iconExpand = 'icon-plus';
      }
      if (attrs.iconCollapse == null) {
        attrs.iconCollapse = 'icon-minus';
      }
      if (attrs.iconLeaf == null) {
        attrs.iconLeaf = 'icon-chevron-right';
      }
      if (attrs.expandLevel == null) {
        attrs.expandLevel = '3';
      }
      expand_level = parseInt(attrs.expandLevel, 10);
      scope.header = attrs.header;
      if (!scope.treeData) {
        alert('no treeData defined for the tree!');
      }
      if (scope.treeData.length == null) {
        if (treeData._digger != null) {
          scope.treeData = [treeData];
        } else {
          alert('treeData should be an array of root branches');
        }
      }
      for_each_branch = function(f) {
        var do_f, root_branch, _i, _len, _ref, _results;
        do_f = function(branch, level) {
          var child, _i, _len, _ref, _results;
          f(branch, level);
          if (branch._children != null) {
            _ref = branch._children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              child = _ref[_i];
              _results.push(do_f(child, level + 1));
            }
            return _results;
          }
        };
        _ref = scope.treeData;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          root_branch = _ref[_i];
          _results.push(do_f(root_branch, 1));
        }
        return _results;
      };
      for_each_branch(function(b, level) {
        b.level = level;
        return b._data.expanded = b.level < expand_level;
      });


      scope.selectedid = null;

      

      select_branch = function(branch) {
        scope.selectedid = branch._digger.diggerid;
        
        if (branch.onSelect != null) {
          return $timeout(function() {
            return branch.onSelect(branch);
          });
        } else {
          if (scope.onSelect != null) {
            return $timeout(function() {
              return scope.onSelect({
                branch: branch
              });
            });
          }
        }
      };
      scope.$on('tree:reset', function(ev){
        scope.selectedid = null;
      })
      scope.$on('tree:setselected', function(ev, selected){
        scope.selectedid = selected._digger.diggerid;
      })
      scope.user_clicks_branch = function(branch) {
        if (branch !== selected_branch){
          return select_branch(branch);
        }
      };
      scope.togglebranch = function(branch, value){
        branch._data.expanded = arguments.length>1 ? value : !branch._data.expanded; 
        scope.$emit('tree:toggle', branch);
      }
      scope.tree_rows = [];
      on_treeData_change = function() {
        var add_branch_to_list, root_branch, _i, _len, _ref, _results;
        scope.tree_rows = [];
        for_each_branch(function(branch) {
          if (branch._children) {
            if (branch._children.length > 0) {
              return branch._children = branch._children.map(function(e) {
                if (typeof e === 'string') {
                  return {
                    name: e,
                    children: []
                  };
                } else {
                  return e;
                }
              })
            }
          } else {
            return branch._children = [];
          }
        });
        add_branch_to_list = function(level, branch, visible) {
          var child, child_visible, tree_icon, expand_icon, _i, _len, _ref, _results;
          if(!branch._data){
            branch._data = {};
          }

          if(branch._data.tree_filter!==undefined){
            if(!branch._data.tree_filter){
              return;
            }
          }

          var filtered_children = (branch._children || []).filter(function(c){
            var data = c._data || {};
            if(data.tree_filter!==undefined){
              if(!data.tree_filter){
                return false;
              }
            }
            return true;
          })

          var has_children = filtered_children.length>0;

          if (branch._data.expanded == null) {
            branch._data.expanded = false;
          }

          /*
          if (!branch._children || branch._children.length === 0) {
            tree_icon = attrs.iconLeaf;
          } else {
            
          }
          */

          tree_icon = 'icon-folder-close';
          if(has_children){

            if (branch._data.expanded) {
              expand_icon = attrs.iconCollapse;
            } else {
              expand_icon = attrs.iconExpand;
            }  
          }

          if(branch._data.tree_icon){
            tree_icon = branch._data.tree_icon;
          }
          
          var digger = branch._digger || {};
          scope.tree_rows.push({
            level: level,
            branch: branch,
            _label: branch.name || branch.title || digger.tag || 'model',
            tree_icon: tree_icon,
            expand_icon: expand_icon,
            visible: visible
          });
          if (branch._children != null) {
            _ref = branch._children;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              child = _ref[_i];
              child_visible = visible && branch._data.expanded;
              _results.push(add_branch_to_list(level + 1, child, child_visible));
            }
            return _results;
          }
        };
        _ref = scope.treeData;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          root_branch = _ref[_i];
          _results.push(add_branch_to_list(1, root_branch, true));
        }
        if(!scope.selectedid && scope.treeData[0] && scope.treeData[0]._digger){
          scope.selectedid = scope.treeData[0]._digger.diggerid;
        }
        return _results;
      };
      
      return scope.$watch('treeData', on_treeData_change, true);
    }
  };
});

});
require.register("binocarlos-bootstrap-tree-for-angular/dist/abn_tree_template.js", function(exports, require, module){
module.exports = '<ul class="nav nav-list abn-tree">\n  <li \n  	ng-repeat="row in tree_rows | filter:{visible:true} track by row.branch._id" \n  	ng-animate="\'abn-tree-animate\'" \n  	ng-class="\'level-\' + {{ row.level }} + (row.branch._id == selectedid ? \' active\':\'\')" \n  	class="abn-tree-row">\n  		<a ng-click="user_clicks_branch(row.branch)">\n  			<i \n  				ng-class="row.expand_icon" \n  				ng-click="togglebranch(row.branch)" \n  				class="indented tree-icon"> </i>\n  			<i ng-class="row.tree_icon" \n  				 ng-click="togglebranch(row.branch)" \n  				 class="indented tree-icon"></i>\n  			<span class="indented tree-label">{{ row._label }}</span>\n  	  </a>\n  </li>\n</ul>';
});
require.register("binocarlos-digger-tree-for-angular/index.js", function(exports, require, module){
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
});
require.register("binocarlos-digger-tree-for-angular/template.js", function(exports, require, module){
module.exports = '<div>\n<div ng-transclude></div>\n <abn-tree tree-data="treedata" on-select="container_select(branch)" expand-level="depth"></abn-tree>\n</div>';
});
require.register("binocarlos-digger-viewer-for-angular/index.js", function(exports, require, module){
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
});
require.register("binocarlos-digger-viewer-for-angular/template.js", function(exports, require, module){
module.exports = '<div>\n  <div class="row" ng-show="deletemode">\n    Are you sure?<br /><br />\n\n    <button class="btn btn-info" ng-click="canceldelete()">No Cancel</button>\n    <button class="btn btn-danger" ng-click="deletecontainer(true)">Yes! Delete</button>\n  </div>\n\n  <div ng-hide="deletemode">\n    <ul class="nav nav-tabs" id="viewerTab">\n      <li ng-show="showchildren" ng-class="{active:tabmode==\'children\'}"><a style="cursor:pointer;" ng-click="setmode(\'children\')">Children</a></li>\n      <li ng-show="showdetails" ng-class="{active:tabmode==\'details\'}"><a style="cursor:pointer;" ng-click="setmode(\'details\')">Details</a></li>\n      \n    </ul>\n    <div id="myTabContent" class="tab-content">\n      <div ng-show="showdetails" ng-class="{active:tabmode==\'details\', in:tabmode==\'details\', fade:tabmode!=\'details\'}" class="tab-pane" id="details" style="margin-top:20px;">\n         <form class="form form-horizontal" name="containerForm" onSubmit="return false;" ng-hide="deletemode">\n\n            <fieldset>\n              \n                <form novalidate>\n                  <digger-form fields="blueprint.fields" container="edit_container" />\n                </form>\n\n                <div class="pull-right">\n                  <a href="" ng-click="toggledigger()">\n                  <span ng-show="diggeractive">-</span>\n                  <span ng-hide="diggeractive">+</span>\n                   digger\n                  </a>\n                </div>\n\n                <div ng-show="diggeractive">\n                  <hr />\n                  <form novalidate>\n                    <digger-form fields="digger_fields" container="edit_container">\n                      <div class="form-group" ng-show="settings.container_url">\n                        <label for="warehouselink" class="col-sm-3 control-label ng-binding">URL:</label>\n                        <div class="col-sm-7" style="overflow:none;">\n                          <input type="text" readonly class="form-control" ng-model="settings.container_url" />\n                        </div>\n                      </div>\n                    </digger-form>\n                  </form>\n\n                  \n                </div>\n\n                <div class="form-group text-center" style="margin-top:10px;">\n                    <button ng-show="addmode" class="btn btn-warning" ng-click="cancelcontainer()">Cancel</button>\n                    <button ng-hide="hidedelete()" class="btn btn-info" ng-click="deletecontainer()">Delete</button>\n                    <button class="btn btn-success" ng-click="savecontainer()">Save</button>\n                    \n                </div>\n              \n            </fieldset>\n\n          </form>\n\n\n        \n\n      </div>\n      <div ng-show="showchildren" ng-class="{active:tabmode==\'children\', in:tabmode==\'children\', fade:tabmode!=\'children\'}" class="tab-pane" id="children" style="margin-top:20px;">\n\n        <div>\n\n        	<div class="digger-viewer-container" ng-repeat="$digger in children" ng-click="click_container($digger)">\n\n            <div style="margin-bottom:5px;">\n              <i class="icon" ng-class="geticon($digger)"></i>\n            </div>\n            <div>\n        		  {{ $digger.title() }}\n            </div>\n\n          </div>\n\n        </div>\n        <hr style="clear: left;" />\n        <div>\n          <button style="margin:10px;" class="btn btn-sm btn-info" ng-click="add_from_blueprint(blueprint)" ng-repeat="blueprint in addchildren">new {{ blueprint.title() }}</button>\n        </div>\n\n      </div>\n    </div>\n  </div>';
});
require.register("binocarlos-digger-utils-for-angular/index.js", function(exports, require, module){
/*

  tools used across the other files
  
*/

angular
  .module('digger.utils', [
    
  ])

  .factory('$safeApply', [function($rootScope) {
    return function($scope, fn) {
      var phase = $scope.$root.$$phase;
      if(phase == '$apply' || phase == '$digest') {
        if (fn) {
          $scope.$eval(fn);
        }
      } else {
        if (fn) {
          $scope.$apply(fn);
        } else {
          $scope.$apply();
        }
      }
    }
  }])

});
require.register("digger-folders/index.js", function(exports, require, module){
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
});



require.alias("binocarlos-digger-tree-for-angular/index.js", "digger-folders/deps/digger-tree-for-angular/index.js");
require.alias("binocarlos-digger-tree-for-angular/template.js", "digger-folders/deps/digger-tree-for-angular/template.js");
require.alias("binocarlos-digger-tree-for-angular/index.js", "digger-folders/deps/digger-tree-for-angular/index.js");
require.alias("binocarlos-digger-tree-for-angular/index.js", "digger-tree-for-angular/index.js");
require.alias("binocarlos-digger-utils-for-angular/index.js", "binocarlos-digger-tree-for-angular/deps/digger-utils-for-angular/index.js");
require.alias("binocarlos-digger-utils-for-angular/index.js", "binocarlos-digger-tree-for-angular/deps/digger-utils-for-angular/index.js");
require.alias("binocarlos-digger-utils-for-angular/index.js", "binocarlos-digger-utils-for-angular/index.js");
require.alias("binocarlos-bootstrap-tree-for-angular/dist/abn_tree_directive.js", "binocarlos-digger-tree-for-angular/deps/bootstrap-tree-for-angular/dist/abn_tree_directive.js");
require.alias("binocarlos-bootstrap-tree-for-angular/dist/abn_tree_template.js", "binocarlos-digger-tree-for-angular/deps/bootstrap-tree-for-angular/dist/abn_tree_template.js");
require.alias("binocarlos-bootstrap-tree-for-angular/dist/abn_tree_directive.js", "binocarlos-digger-tree-for-angular/deps/bootstrap-tree-for-angular/index.js");
require.alias("binocarlos-bootstrap-tree-for-angular/dist/abn_tree_directive.js", "binocarlos-bootstrap-tree-for-angular/index.js");
require.alias("binocarlos-digger-tree-for-angular/index.js", "binocarlos-digger-tree-for-angular/index.js");
require.alias("binocarlos-digger-viewer-for-angular/index.js", "digger-folders/deps/digger-viewer-for-angular/index.js");
require.alias("binocarlos-digger-viewer-for-angular/template.js", "digger-folders/deps/digger-viewer-for-angular/template.js");
require.alias("binocarlos-digger-viewer-for-angular/index.js", "digger-folders/deps/digger-viewer-for-angular/index.js");
require.alias("binocarlos-digger-viewer-for-angular/index.js", "digger-viewer-for-angular/index.js");
require.alias("binocarlos-digger-viewer-for-angular/index.js", "binocarlos-digger-viewer-for-angular/index.js");
require.alias("binocarlos-digger-utils-for-angular/index.js", "digger-folders/deps/digger-utils-for-angular/index.js");
require.alias("binocarlos-digger-utils-for-angular/index.js", "digger-folders/deps/digger-utils-for-angular/index.js");
require.alias("binocarlos-digger-utils-for-angular/index.js", "digger-utils-for-angular/index.js");
require.alias("binocarlos-digger-utils-for-angular/index.js", "binocarlos-digger-utils-for-angular/index.js");
require.alias("digger-folders/index.js", "digger-folders/index.js");