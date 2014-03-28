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
			    //input[0].type='text';
			}
			input[0].min = scope.value.ui_units_min_val;
			input[0].max = scope.value.ui_units_max_val;
			input[0].step = 'any';
                    }, true);

                    scope.submit = function () {
			// We have to validate some contraints manually due to AngularJS limitations
			// (e.g. min/max ignored if set dynamically) and fact that input-type directive
			// also causes some type-specific attributes to be ignored.

			if (scope.edit_value < scope.value.ui_units_min_val)
			{
			    scope.myForm.myInput.$valid = false;
			    scope.myForm.myInput.$invalid = true;
			    scope.myForm.myInput.$error.min = true;
			    scope.validationErr = "Minimum value is: " + scope.value.ui_units_min_val;
			}
			else if (scope.edit_value > scope.value.ui_units_max_val) {
			    scope.myForm.myInput.$valid = false;
			    scope.myForm.myInput.$invalid = true;
			    scope.myForm.myInput.$error.max = true;
			    scope.validationErr = "Maximum value is " + scope.value.ui_units_max_val;
			}
			else if (scope.myForm.myInput.$error.required) {
			    // Though this code block can be triggered, the new value of scope.validationErr
			    // may not show in the UI (?).
			    scope.validationErr = "A value is is required.";
			}
                        if (scope.myForm.myInput.$valid === true) {
			    //console.log("Input value considered valid");
			    // Since value is an object, we must clone it so that differences between old and new value
			    // are seen.
			    var new_value = angular.copy(scope.value);
			    new_value.scaled_estimate = scope.edit_value;
			    new_value.estimate = filter('ui_units')(new_value,false,true,false);
                            ctrl.updateDataRow(scope.row, scope.column.map, new_value);
                            ctrl.sortBy();//it will trigger the refresh...  (ie it will sort, filter, etc with the new value)
                        }
			else {
			    //console.log("scope.myform.myInput.$valid is false");
			}
                        scope.toggleEditMode();
                    };

                    scope.toggleEditMode = function () {
                        scope.value = getter(scope.row);
			// For some reason, edit of value.scaled_estimate in template doesn't work,
			// so assign to a different scope variable.
			scope.edit_value = Math.round(scope.value.scaled_estimate*100)/100;
                        scope.isEditMode = scope.isEditMode !== true;
			if (scope.isEditMode == true) {
			    scope.validationErr = '';
			    scope.myForm.myInput.$dirty = false;
			    scope.myForm.myInput.$valid = true;
			    scope.myForm.myInput.$invalid = false;
			    scope.myForm.myInput.$error.min = false;
			    scope.myForm.myInput.$error.max = false;
			    scope.myForm.myInput.$error.required = false;
			}
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
