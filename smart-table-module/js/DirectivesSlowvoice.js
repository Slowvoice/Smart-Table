/* Directives */
(function (angular) {
    "use strict";
    angular.module('smartTable.directives')
        //an editable estimate cell
        .directive('editableEstimate', ['templateUrlList', '$parse', '$filter', function (templateList, parse, filter) {
            return {
                restrict: 'EA',
                require: '^smartTable',
                templateUrl: templateList.editableEstimate,
                scope: {
                    row: '=',
                    column: '=',
                    type: '='
                },
                replace: true,
                link: function (scope, element, attrs, ctrl) {
                    var form = angular.element(element.children()[1]),
                        input = angular.element(form.children()[0]),
                        getter = parse(scope.column.map);

                    //init values
                    scope.isEditMode = false;
                    scope.$watch('row', function () {
                        scope.value = getter(scope.row);
			// Example of how to change type of input field based on UI units.
			if (scope.value.ui_units_type == 'dollars') {
			    input[0].type='text';
			}
			// hack:
			//scope.value = scope.column.formatFunction(scope.value_object,'scale_only');
                    }, true);

                    scope.submit = function () {
                        //update model if valid
                        if (scope.myForm.$valid === true) {
			    // Since value is an object, we must clone it so that differences between old and new value
			    // are seen.
			    var new_value = angular.copy(scope.value);
			    new_value.scaled_estimate = scope.edit_value;
			    //new_value.estimate = scope.column.formatFunction(new_value,'reverse_scale');
			    new_value.reverse_scale = true;
			    new_value.estimate = filter('ui_units')(new_value.estimate,new_value);
			    new_value.reverse_scale = false;
                            ctrl.updateDataRow(scope.row, scope.column.map, new_value);
                            ctrl.sortBy();//it will trigger the refresh...  (ie it will sort, filter, etc with the new value)
                        }
                        scope.toggleEditMode();
                    };

                    scope.toggleEditMode = function () {
                        scope.value = getter(scope.row);
			// For some reason, edit of value.scaled_estimate in template doesn't work,
			// so assign to a different scope variable.
			scope.edit_value = scope.value.scaled_estimate;
                        scope.isEditMode = scope.isEditMode !== true;
                    };

                    scope.$watch('isEditMode', function (newValue) {
                        if (newValue === true) {
                            input[0].select();
                            input[0].focus();
                        }
                    });

                    input.bind('blur', function () {
                        scope.$apply(function () {
                            scope.submit();
                        });
                    });
                }
            };
        }]);
})(angular);
