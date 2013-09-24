require('./iconlist');

angular
  .module('diggerdubs.database', [
    'digger',
    'diggerdubs.iconlist'
  ])

	/*
  
    the ACCOUNT DETAILS controller
    
  */
  .controller('DatabaseCtrl', ['$scope', '$http', '$digger', '$stateParams', '$location', '$safeApply', '$diggerFieldTypes', function($scope, $http, $digger, $stateParams, $location, $safeApply, $diggerFieldTypes){
    
    $scope.accessloaded = false;
    $scope.access = false;
    $scope.readonly = true;

    $scope.showingcode = false;


    $scope.fieldtypes = $diggerFieldTypes;

    $scope.database_path = $stateParams.username + '/' + $stateParams.database_name;
    $scope.database_name = $stateParams.database_name;
    $scope.database_context = $stateParams.context;
    $scope.showaddbutton = true;
    $scope.savingblueprint = false;

    /*
    
      yuck
      
    */
    $scope.formeditmode = false;

    $scope.selector = '> *';

    $scope.warehouse = $digger.connect('/' + $scope.database_path);
    $scope.warehouse.attr('name', $scope.database_name);
    $scope.container = $scope.warehouse;

    $scope.clipboard_container = null;

    $scope.editing_container = null;
    $scope.editmode = false;

    $scope.selection = {};
    $scope.selectionbools = {};

    /*
    
      the fields used for the generic folder and item blueprint

    */
    $scope.genericfields = [{
      name:'name'
    }]

    var coreblueprints = {
      folder:true,
      item:true,
      blueprint:true
    }

    /*
    
      the fields used for the digger side of the form
      
    */
    $scope.diggerfields = [{
      name:'_digger.tag',
      title:'tag'
    },{
      name:'_digger.id',
      title:'id'
    },{
      name:'_digger.class',
      type:'diggerclass',
      title:'class'
    }]

    $http.get('/api/v1/user/' + $stateParams.username).success(function(body){
      $scope.viewuser = $digger.create(body);
    })

    /*
    
      get the access level for the current user
      
    */
    $http.get('/api/v1/access/' + $stateParams.username + '/' + $stateParams.database_name).success(function(body){
      $scope.accessloaded = true;
      $scope.access = body.access!='none';
      $scope.readonly = body.access=='read';
      $scope.load_data();
    })

    /*
    
      leave editmode
      
    */
    $scope.cancelform = function(){
      $scope.editing_container = null;
      $scope.editmode = false;
    }

    /*
    
      the form has been saved - if adding then append otherwise just save
      
    */
    $scope.submitform = function(){
      if($scope.adding){
        $scope.container.append($scope.editing_container).ship(function(){
          $.growl.notice({ message: $scope.editing_container.title() + ' added' });
          $safeApply($scope, function(){
            $scope.editing_container = null;
            $scope.editmode = false;
            $scope.clear_selection();
            //$scope.load_data();
          })
        })
      }
      else{
        $scope.editing_container.save().ship(function(){
          $.growl.notice({ message: $scope.editing_container.title() + ' saved' });
          $safeApply($scope, function(){
            if($scope.editing_container.is('blueprint')){
              console.log('-------------------------------------------');
              console.log('loading blueprint');
              $scope.loadblueprints();
            }
            $scope.editing_container = null;
            $scope.editmode = false;
            $scope.clear_selection();

            //$scope.load_data();
          })
        })
      }
    }

    $scope.edit_container = function(container){
      
      $scope.editing_container = container;
      $scope.editfields = [];
      $scope.adding = false;
      $scope.editmode = true;
      $scope.showaddbutton = true;
      $scope.savingblueprint = false;
      $scope.formeditmode = container.is('blueprint');

      $scope.canceladdfield();

      $scope.editing_container.data('readonly', $scope.readonly);

      setTimeout(function(){
        $('#editdefaulttab').click();  
      }, 1)
      

      /*
      
        does the container have a blueprint associated?

        merge it's fields if so
        
      */
      var blueprintid = container.digger('blueprint');
      if(blueprintid){
        if(coreblueprints[blueprintid]){
          $scope.editfields = $scope.genericfields.concat($scope.editfields);
        }
        else{

          var blueprint_warehouse = $digger.connect(container.diggerwarehouse());

          blueprint_warehouse('=' + container.digger('blueprint'))
            .ship(function(blueprint){
              $safeApply($scope, function(){
                $scope.editfields = $scope.editfields.concat(blueprint.digger('extra_fields')||[]);
              })
              
            })  
        }
        
      }

      if(container.digger('extra_fields')){
        $scope.editfields = $scope.editfields.concat(container.digger('extra_fields'));
      }

    }


    /*
    
      from the add buttons menu - we enter editor mode and create a new container to edit
      
    */
    $scope.addcontainer = function(blueprint){
      var fields = [];
      var tag = '';
      var blueprintid = '';
      var classnames = [];

      $scope.canceladdfield();

      var icon = null;
      if(_.isString(blueprint)){
        fields = $scope.genericfields;
        tag = blueprint;
        blueprintid = blueprint;
      }
      else{
        fields = blueprint.digger('extra_fields');
        tag = blueprint.digger('blueprinttag');
        classnames = blueprint.classnames() || [];
        blueprintid = blueprint.diggerid();
        icon = blueprint.digger('icon');
      }


      $scope.formeditmode = false;

      $scope.editing_container = $digger.create(tag);
      $scope.editing_container.digger('blueprint', blueprintid);
      $scope.editing_container.digger('icon', icon);
      $scope.editing_container.classnames(classnames);
      $scope.editfields = fields;
      $scope.editmode = true;
      $scope.adding = true;
      $scope.showaddbutton = true;
      $scope.savingblueprint = false;

      setTimeout(function(){
        $('#editdefaulttab').click();  
      }, 1)
    }

    $scope.load_data = function(){
      var selector = $scope.selector;
      var context = $scope.context;

      if(!selector){
        return;
      }

      if($scope.access=='none'){
        return;
      }

      $scope.cancelform();
      $scope.clear_selection();

      var args = [selector];
      if(context){
        args.push(context);
      }

      var contract = $scope.warehouse.apply($scope.warehouse, args);


      contract.ship(function(results){
        $safeApply($scope, function(){          
          $scope.results = $scope.container;
          $scope.results.get(0)._children = results.models;
        })
        
      })
    }

    /*
    
      set the arg as the current container
      
    */
    $scope.open_container = function(container){

      var contextpath = '';
      if(container.tag()!='_supplychain'){
        contextpath += '=' + container.diggerid();
      }
      $scope.context = contextpath;

      $scope.clear_selection();
      $scope.container = container;
      $scope.load_data();
      $scope.editmode = false;
      $scope.adding = false;
      $scope.editing_container = null;


    }

    /*
    
      a single click on the container changes the selection

      a dbl click opens it (above)
      
    */
    $scope.press_container = function(container){
      var val = !($scope.selection[container.diggerid()] || false);

      if(val){
        $scope.selection[container.diggerid()] = container;
        $scope.selectionbools[container.diggerid()] = true;
      }
      else{
        delete($scope.selection[container.diggerid()]);
        delete($scope.selectionbools[container.diggerid()]);
      }

      $scope.confirmmode = false;
      $scope.activeselection = _.values($scope.selection);
    }

    /*
    
      set the selection to []
      
    */
    $scope.clear_selection = function(){
      $scope.activeselection = [];
      $scope.selection = {};
      $scope.selectionbools = {};
    }

    $scope.clear_clipboard = function(){
      $scope.clipboard_container = null;
    }

    /*
    
      generic confirmation window - used for:

        delete
      
    */
    $scope.doconfirm = function(){
      if($scope.confirmaction=='delete'){
        var selcontainer = $scope.get_selection_container();

        var title = selcontainer.count()<=1 ? selcontainer.title() : selcontainer.count() + ' items';
        selcontainer.remove().ship(function(){
          $.growl.notice({ message: title + ' deleted' });
          $scope.load_data();
          $safeApply($scope, function(){
            $scope.clear_selection();
            $scope.confirmmode = false;
          })
        })      
      }
    }



    /*
    
      return a container that holds the current selection
      
    */
    $scope.get_selection_container = function(){
      var container = $scope.warehouse.spawn(_.map($scope.activeselection, function(c){
        return c.get(0)
      }))
      return container;
    }


    /*
    
      copy the current selection container into the clipboard
      
    */
    $scope.copy_selection = function(){
      if($scope.activeselection.length<=0){
        return;
      }
      $.growl.notice({ message: $scope.activeselection.length + ' item' + ($scope.activeselection.length==1 ? '' : 's') + ' copied' });
      $scope.clipboard_mode = 'copy';
      $scope.clipboard_container = $scope.get_selection_container().clone();
      $scope.clear_selection();
    }

    /*
    
      cut the current selection container into the clipboard
      
    */
    $scope.cut_selection = function(){
      if($scope.activeselection.length<=0){
        return;
      }
      $.growl.notice({ message: $scope.activeselection.length + ' item' + ($scope.activeselection.length==1 ? '' : 's') + ' cut' }); 
      $scope.clipboard_mode = 'cut';
      $scope.clipboard_container = $scope.warehouse.spawn($scope.get_selection_container().models);
      $scope.clear_selection();
    }

    /*
    
      if mode is copy - clone the selection and append

      if mode is cut - 
      
    */
    $scope.paste_selection = function(){
      if($scope.clipboard_container.count()<=0){
        return;
      }

      var data = $scope.clipboard_container;

      if($scope.clipboard_mode==='copy'){
        $scope.container.append($scope.clipboard_container).ship(function(){
          $.growl.notice({ message: $scope.clipboard_container.count() + ' item' + ($scope.clipboard_container.count()==1 ? '' : 's') + ' copy pasted' }); 
          $scope.load_data();
          $safeApply($scope, function(){
            $scope.clear_clipboard();
          })
        })
      }
      else if($scope.clipboard_mode==='cut'){

        var toremove = $scope.warehouse.spawn($scope.clipboard_container.models);

        var contract = $scope.clipboard_container('self:tree');

        contract.ship(function(alldata){
          toremove.remove().ship(function(){
            $scope.container.append(alldata).ship(function(){
              $.growl.notice({ message: $scope.clipboard_container.count() + ' item' + ($scope.clipboard_container.count()==1 ? '' : 's') + ' cut pasted' });               
              $scope.load_data();
              $safeApply($scope, function(){
                $scope.clear_clipboard();
              })
              
            })
          })

        })

      }
    }

    $scope.delete_selection = function(){
      $scope.confirmaction='delete';
      $scope.confirmmode = true;
    }


    $scope.treeicon = function(container){
      if(!container){
        return 'icon-folder-close';
      }
      var def = container.tag()=='item' ? 'icon-file' : 'icon-folder-close';
      return container ? (container.digger('icon') || def) : def;
    }

    $scope.get_json = function(){
      return $scope.editing_container ? JSON.stringify($scope.editing_container.get(0), null, 4) : '';
    }

    $scope.get_xml = function(){
      return $scope.editing_container ? $scope.editing_container.toXML() : '';
    }


    $scope.reset_selectors = function(){
      $scope.selector='> *';
      $scope.context='';
      $scope.container = $scope.warehouse;
      $scope.$broadcast('manualcontext');
      $scope.load_data();
    }

    $scope.addfield = function(type){
      $scope.addingfield = true;
      $scope.editfieldmode = false;
      $scope.deletingfield = false;
      $scope.newfield_properties = _.clone($diggerFieldTypes.properties[type]);
      $scope.newfield_properties.type = type;

      $scope.newfield = {
        name:'',
        type:type
      }
    }


    $scope.canceladdfield = function(){
      $scope.addingfield = false;
      $scope.deletingfield = false;
      $scope.savingblueprint = false;
    }

    $scope.apply_saveblueprint = function(){
      if(!$scope.blueprint_name.match(/\w/)){
        $.growl.error({ message: 'field name must letters and numbers, no spaces'});
        return;
      }

      var fields = $scope.editing_container.digger('extra_fields');
      var blueprint = $scope.editing_container.clone();

      
      blueprint.digger('blueprint', '');
      blueprint.digger('blueprinttag', blueprint.tag());
      blueprint.tag('blueprint');
      blueprint.attr('name', $scope.blueprint_name);
      blueprint.digger('extra_fields', $scope.editfields);

      $scope.warehouse.append(blueprint).ship(function(){
        $.growl.notice({ message: blueprint.title() + ' blueprint has been saved'});
        $safeApply($scope, function(){
          $scope.cancelform();
          $scope.loadblueprints();
        })
      })
    }

    $scope.loadblueprints = function(){
      $scope.warehouse('blueprint:sort(name)').ship(function(blueprints){
        $safeApply($scope, function(){
          $scope.blueprints = blueprints;  
        })
      })
      
    }

    $scope.$on('deletefield', function($ev, field){
      $scope.deletingfield = true;
      $scope.editfieldmode = false;
      $scope.field_to_delete = field;
    })

    $scope.$on('editfield', function($ev, field){
      $scope.addingfield = true;
      $scope.editfieldmode = true;
      $scope.deletingfield = false;
      $scope.newfield = field;
      $scope.newfield_properties = _.clone($diggerFieldTypes.properties[field.type]);
      $scope.newfield_properties.type = field.type;



    })

    $scope.loadblueprints();


    $scope.doconfirmdeletefield = function(){
      
      $scope.deletingfield = false;
      $scope.addingfield = false;

      var fields = ([]).concat(_.filter($scope.editfields, function(f){
        return f.name!=$scope.field_to_delete.name;
      }))
      var cfields = $scope.editing_container.digger('extra_fields') || [];

      var containerfields = ([]).concat(_.filter(cfields, function(f){
        return f.name!=$scope.field_to_delete.name;
      }))
      

      setTimeout(function(){
        $safeApply($scope, function(){
          $scope.editfields = fields;
          $scope.editing_container.digger('extra_fields', containerfields)
        })
      }, 1)
      return;
    }    

    $scope.applyaddfield = function(){

      if(!$scope.newfield.name.match(/^\w+$/)){
        $.growl.error({ message: 'field name must letters and numbers, no spaces'});
        return;
      }

      if($scope.editfieldmode){
        $scope.addingfield = false;
        var fields = ([]).concat($scope.editfields);
        $scope.editfields = [];

        setTimeout(function(){
          $safeApply($scope, function(){
            $scope.editfields = fields;
          })
        }, 1)
        return;
      }

      var savefield = {
        type:$scope.newfield_properties.type,
        name:$scope.newfield.name.toLowerCase(),
        options_csv:$scope.newfield.options_csv,
        options_warehouse:$scope.newfield.options_warehouse,
        options_selector:$scope.newfield.options_selector
      }
      
      //field.name = field.name.toLowerCase()

      var existing = _.find($scope.editfields, function(existing_field){
        return existing_field.name==savefield.name;
      })

      if(existing){
        $.growl.error({ message: 'there is already a field named: ' + savefield.name});
        return;
      }

      var extrafields = $scope.editing_container.digger('extra_fields') || [];
      $scope.editfields.push(savefield);
      extrafields.push(savefield);
      $scope.editing_container.digger('extra_fields', extrafields);
      $scope.addingfield = false;
    }

    $scope.$watch('selector', function(selector){
      $scope.load_data();
    })

    $scope.$watch('context', function(context){
      /*
      
        this means they are manually entering a context - reset to the warehouse selected
        
      */
      if(context && context!='' && context!='=' + $scope.container.diggerid()){
        $scope.manualcontext = true;
        $scope.$broadcast('manualcontext');
        $scope.container = $scope.warehouse;
      }
      else{
        $scope.manualcontext = false;
      }

      $scope.load_data();
    })

    $scope.$on('loadcontainer', function($ev, container){
      $scope.open_container(container);
    })

    $scope.attr_summary = function(container){
      return _.map(_.filter(_.keys(container.get(0)), function(prop){
        if(prop.indexOf('_')==0){
          return false;
        }
        if(prop=='name' || prop=='title'){
          return false;
        }
        var val = container.attr(prop);

        if(!val){
          return false;
        }

        return _.isString(val) || _.isNumber(val) || _.isBoolean(val);
      }), function(prop){
        var val = container.attr(prop) || '';
        var extra = '';
        if(('' + val).length>12){
          extra = '...';
        }
        return prop + ' = ' + ('' + val).substr(0, 12) + extra;
      }).join(', ');
    }

    $scope.seecode = function(lang){
      $scope.showingcode = true;
      $scope.codetype = lang;
    }

    var code_langs = {
      html:function(){

        var code = [
          '<script src="http://' + window.location.hostname + '/digger/angular"></script>'
        ];

        if(!_.isEmpty($scope.context)){
          code.push('<digger warehouse="' + $scope.database_path + '" selector="' + $scope.selector + '" context="' + $scope.context + '" ng-cloak>');
        }
        else{
          code.push('<digger warehouse="' + $scope.database_path + '" selector="' + $scope.selector + '" ng-cloak>');
        }

        code = code.concat([
            'loaded: {{ results.count() }}<br />',
            '<ul>',
              '<li ng-repeat="item in results.containers()">',
              '  {{ item.title() }} is a digger {{ item.tag() }}',
              '</li>',
            '</ul>',
          '</digger>'
        ])

        code = code.join("\n");

        return code;
      },
      js:function(){
        
        var code = [
          '<script src="http://' + window.location.hostname + '/digger"></script>',
          '<script>',
          '   $digger(function(){',
          '     var warehouse = $digger.connect(\'' + $scope.database_path + '\');'
        ];

        if(!_.isEmpty($scope.context)){
          code.push('     warehouse(\'' + $scope.selector + '\', \'' + $scope.context + '\')');
        }
        else{
          code.push('     warehouse(\'' + $scope.selector + '\')');
        }

        code = code.concat([
          '       .ship(function(results){',
          '         console.log(results.count() + \' loaded\');',
          '         results.each(function(result){',
          '             console.log(\'   - \' + result.title() + \' is a digger \' + result.tag());',
          '         })',
          '       })',
          '   })',
          '</script>'
        ])
        
        code = code.join("\n");

        return code;
      },
      rest:function(){

        var command = 'curl --request GET \'http://' + window.location.hostname + '/digger/api/v1/' + $scope.database_path + '?selector="' + $scope.selector + '"';
        
        if(!_.isEmpty($scope.context)){
          command += '&context=' + $scope.context;
        }

        return command;
      }
    }

    $scope.get_code = function(lang){
      return code_langs[lang]();
    }

    var packets_done = {};

    function switchboard_listen(packet){
      if(packets_done[packet.id]){
        return;
      }
      packets_done[packet.id] = true;

      if(packet.user){
        if($digger.user.diggerid()==packet.user.id){
          return;
        }

        $.growl.notice({ message: packet.user.username + ' did a ' + packet.action});
      }
      
    }

    $digger.on('switchboard', switchboard_listen);

    $scope.$on('$destroy', function(){
      $digger.removeListener('switchboard', switchboard_listen);      
    })

    




  }])
